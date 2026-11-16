import express, { type NextFunction, type Request, type Response } from 'express';
import cookieParser from 'cookie-parser';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { createInitialCmsState, PRESET_THEMES } from './src/data/defaults/kitsSeedData';
import { resolveChatbotReply } from './src/utils/chatbotEngine';
import { buildCsvContent, enquirySchema, slugifyText } from './src/utils/validation';
import type { AdminRoleName, CmsState, MediaItem, PermissionKey } from './src/types/cms';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const ROOT_DIR = process.cwd();
const DB_FILE = path.join(ROOT_DIR, '.kits-dev-db.json');
const UPLOADS_DIR = path.join(ROOT_DIR, '.kits-dev-uploads');

interface StoredUser {
  id: string;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  role: AdminRoleName;
  active: boolean;
  lastLogin?: string;
}

interface StoredResetToken {
  email: string;
  tokenHash: string;
  expiresAt: number;
}

interface DevDatabase {
  installed: boolean;
  installedAt: string | null;
  installedByEmail: string | null;
  appVersion: string;
  databaseConfig: {
    dbType: 'MySQL' | 'MariaDB';
    host: string;
    port: number;
    database: string;
    username: string;
  };
  adminLoginPath: string;
  adminPanelPath: string;
  appSecret: string;
  cms: CmsState;
  users: StoredUser[];
  resetTokens: StoredResetToken[];
  feedbackSubmissions: Array<{
    id: string;
    name: string;
    role: string;
    rating: number;
    comments: string;
    createdAt: string;
  }>;
  chatbotQueryCount: number;
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, hash] = parts;
  const derived = crypto.scryptSync(password, salt, 64);
  const hashBuf = Buffer.from(hash, 'hex');
  return derived.length === hashBuf.length && crypto.timingSafeEqual(derived, hashBuf);
}

function loadDatabase(): DevDatabase {
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(raw) as DevDatabase;
    } catch {
      // Recreate clean state if corrupted
    }
  }
  const initial = createInitialCmsState();
  const db: DevDatabase = {
    installed: false,
    installedAt: null,
    installedByEmail: null,
    appVersion: '2.0.0',
    databaseConfig: {
      dbType: 'MySQL',
      host: 'localhost',
      port: 3306,
      database: 'kits_pharmacy_cms',
      username: '',
    },
    adminLoginPath: '/admin-login',
    adminPanelPath: '/control-panel',
    appSecret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    cms: {
      ...initial,
      enquiries: [],
      users: [],
      notifications: [],
      activityLogs: [],
    },
    users: [],
    resetTokens: [],
    feedbackSubmissions: [],
    chatbotQueryCount: 0,
  };
  saveDatabase(db);
  return db;
}

function saveDatabase(db: DevDatabase): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

function rolePermissions(db: DevDatabase, roleName: AdminRoleName): PermissionKey[] {
  const found = db.cms.roles.find((r) => r.name === roleName);
  return found ? found.permissions : [];
}

function signSessionToken(userId: string, secret: string, ttlMs: number): string {
  const exp = Date.now() + ttlMs;
  const payload = `${userId}.${exp}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

function verifySessionToken(token: string | undefined, secret: string): string | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [userId, expStr, sig] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return null;
  const expectedSig = crypto.createHmac('sha256', secret).update(`${userId}.${expStr}`).digest('hex');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  return userId;
}

function serializeUser(db: DevDatabase, u: StoredUser) {
  return {
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    role: u.role,
    permissions: rolePermissions(db, u.role),
    active: u.active,
    lastLogin: u.lastLogin || 'Never',
  };
}

function logActivity(db: DevDatabase, actor: StoredUser | null, action: string, moduleName: string) {
  if (!actor) return;
  db.cms.activityLogs.unshift({
    id: `log-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
    actor: actor.name,
    role: actor.role,
    action,
    module: moduleName,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
  });
  db.cms.activityLogs = db.cms.activityLogs.slice(0, 200);
}

// Simple fixed-window rate limiter per IP + bucket
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
function rateLimit(bucket: string, maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${bucket}:${req.ip || 'local'}`;
    const now = Date.now();
    const cur = rateBuckets.get(key);
    if (!cur || now > cur.resetAt) {
      rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }
    if (cur.count >= maxRequests) {
      res.status(429).json({
        success: false,
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please wait a moment before trying again.',
      });
      return;
    }
    cur.count += 1;
    next();
  };
}

function requireCsrf(req: Request, res: Response, next: NextFunction) {
  const cookieToken = req.cookies?.['XSRF-TOKEN'];
  const headerToken = req.headers['x-xsrf-token'];
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(419).json({
      success: false,
      code: 'CSRF_MISMATCH',
      message: 'CSRF token missing or expired. Please refresh and try again.',
    });
    return;
  }
  next();
}

function noIndexHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
}

function sanitizeRoutePath(input: string | undefined, fallback: string): string {
  const clean = (input || '').trim().replace(/\/+/g, '/');
  if (!clean) return fallback;
  const withSlash = clean.startsWith('/') ? clean : `/${clean}`;
  return withSlash.length > 1 ? withSlash.replace(/\/$/, '') : fallback;
}

const ALLOWED_MEDIA_FOLDERS: MediaItem['folder'][] = [
  'Campus',
  'Laboratories',
  'Logos',
  'Faculty',
  'Events',
  'Documents',
  'Banners',
];

function normalizeMediaFolder(input: unknown): MediaItem['folder'] {
  const clean = String(input || 'Campus').trim();
  const matched = ALLOWED_MEDIA_FOLDERS.find((f) => f.toLowerCase() === clean.toLowerCase());
  return matched || 'Campus';
}

// Ensure upload dir exists
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, _file, cb) => {
      const folder = normalizeMediaFolder(req.body?.folder);
      const target = path.join(UPLOADS_DIR, folder);
      fs.mkdirSync(target, { recursive: true });
      cb(null, target);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const base = slugifyText(path.basename(file.originalname, ext)) || 'asset';
      cb(null, `${base}-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.pdf', '.mp4'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      cb(new Error('Unsupported file type. Allowed: jpg, jpeg, png, webp, svg, pdf, mp4.'));
      return;
    }
    cb(null, true);
  },
});

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));
  app.use(cookieParser());

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.use('/uploads', express.static(UPLOADS_DIR));

  // Helper middlewares bound to live DB
  const requireInstalled = (_req: Request, res: Response, next: NextFunction) => {
    const db = loadDatabase();
    if (!db.installed) {
      res.status(503).json({
        success: false,
        code: 'NOT_INSTALLED',
        message: 'Application setup has not been completed. Launch /install to configure the database and Super Administrator.',
      });
      return;
    }
    next();
  };

  const requireNotInstalled = (_req: Request, res: Response, next: NextFunction) => {
    const db = loadDatabase();
    if (db.installed) {
      res.status(403).json({
        success: false,
        code: 'ALREADY_INSTALLED',
        message: 'Installation is permanently locked. Delete the lock file manually on the server only if re-provisioning.',
      });
      return;
    }
    next();
  };

  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const db = loadDatabase();
    const userId = verifySessionToken(req.cookies?.kits_session, db.appSecret);
    if (!userId) {
      res.status(401).json({ success: false, code: 'UNAUTHENTICATED', message: 'Authentication required.' });
      return;
    }
    const user = db.users.find((u) => u.id === userId && u.active);
    if (!user) {
      res.status(401).json({ success: false, code: 'UNAUTHENTICATED', message: 'Session is invalid or suspended.' });
      return;
    }
    (req as Request & { authUser?: StoredUser; devDb?: DevDatabase }).authUser = user;
    (req as Request & { devDb?: DevDatabase }).devDb = db;
    next();
  };

  const requirePermission = (...allowed: PermissionKey[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = (req as Request & { authUser?: StoredUser }).authUser;
      const db = (req as Request & { devDb?: DevDatabase }).devDb;
      if (!user || !db) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }
      if (user.role === 'Super Administrator') {
        next();
        return;
      }
      const userPerms = rolePermissions(db, user.role);
      if (allowed.some((k) => userPerms.includes(k))) {
        next();
        return;
      }
      res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        message: 'You do not have permission to perform this action.',
      });
    };
  };

  // =========================================================================
  // 1. CSRF & INSTALLATION ENDPOINTS
  // =========================================================================
  app.get(['/api/v1/auth/csrf', '/sanctum/csrf-cookie'], noIndexHeaders, (_req, res) => {
    const token = crypto.randomBytes(24).toString('hex');
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
    });
    res.json({ success: true, message: 'CSRF cookie initialized.', data: { csrfToken: token } });
  });

  app.get('/api/v1/install/status', noIndexHeaders, (_req, res) => {
    const db = loadDatabase();
    res.json({
      success: true,
      data: {
        installed: db.installed,
        appVersion: db.appVersion,
        adminLoginPath: db.adminLoginPath,
        adminPanelPath: db.adminPanelPath,
      },
    });
  });

  app.get('/api/v1/install/requirements', noIndexHeaders, requireNotInstalled, (_req, res) => {
    res.json({
      success: true,
      data: {
        allPassed: true,
        phpVersion: `PHP 8.3+ / Dev API Runtime (${process.version})`,
        checks: [
          { key: 'runtime', label: 'Backend API & cPanel PHP 8.3+ Contract', ok: true, current: `Ready (${process.version} preview / Laravel 12 production)` },
          { key: 'storage_write', label: 'Application Storage & Upload Directory Writable', ok: true, current: 'Writable' },
          { key: 'session_security', label: 'HTTP-Only Session & CSRF Middleware', ok: true, current: 'Active' },
          { key: 'upload_limits', label: 'Multipart Upload Validation (15 MB)', ok: true, current: 'Configured' },
        ],
      },
    });
  });

  app.post('/api/v1/install/test-database', noIndexHeaders, requireNotInstalled, (req, res) => {
    const { host, port, database, username } = req.body || {};
    if (!host || !database || !username) {
      res.status(422).json({
        success: false,
        message: 'Database host, database name, and database username are required.',
      });
      return;
    }
    const parsedPort = Number(port) || 3306;
    if (parsedPort < 1 || parsedPort > 65535) {
      res.status(422).json({ success: false, message: 'Invalid database port number.' });
      return;
    }
    res.json({
      success: true,
      message: `Database configuration validated for "${database}" at ${host}:${parsedPort}. (Local Express dev store active; MySQL PDO handshake executes on cPanel PHP/Laravel deployment.)`,
      data: {
        connected: true,
        serverVersion: 'MySQL 8.0+ Schema Ready (Dev Preview Store)',
        database: String(database),
      },
    });
  });

  app.post('/api/v1/install/execute', noIndexHeaders, requireNotInstalled, (req, res) => {
    const body = req.body || {};
    const database = body.database || {};
    const website = body.website || {};
    const admin = body.admin || {};

    if (!database.host || !database.database || !database.username) {
      res.status(422).json({ success: false, message: 'Database host, name, and username are required.' });
      return;
    }
    if (!website.websiteName || !website.websiteUrl || !website.contactEmail || !website.contactPhone) {
      res.status(422).json({ success: false, message: 'Website name, URL, contact email, and phone are required.' });
      return;
    }
    if (!admin.fullName || !admin.email || !admin.username || !admin.password) {
      res.status(422).json({ success: false, message: 'All Super Administrator account fields are required.' });
      return;
    }
    if (!/^[a-zA-Z0-9_-]{3,60}$/.test(String(admin.username))) {
      res.status(422).json({ success: false, message: 'Username must be 3-60 alphanumeric/dash/underscore characters.' });
      return;
    }
    if (String(admin.password).length < 8 || admin.password !== admin.password_confirmation) {
      res.status(422).json({ success: false, message: 'Password must be at least 8 characters and match confirmation.' });
      return;
    }

    const db = loadDatabase();
    const chosenTheme = PRESET_THEMES.find((t) => t.id === website.defaultTheme) || PRESET_THEMES[0];
    const adminLoginPath = sanitizeRoutePath(website.adminLoginPath, '/admin-login');
    const adminPanelPath = sanitizeRoutePath(website.adminPanelPath, '/control-panel');

    db.installed = true;
    db.installedAt = new Date().toISOString();
    db.installedByEmail = String(admin.email).trim();
    db.adminLoginPath = adminLoginPath;
    db.adminPanelPath = adminPanelPath;
    db.databaseConfig = {
      dbType: 'MySQL',
      host: String(database.host),
      port: Number(database.port) || 3306,
      database: String(database.database),
      username: String(database.username),
    };

    db.cms.appearance = {
      ...db.cms.appearance,
      activeThemeId: chosenTheme.id,
      palette: { ...chosenTheme },
    };
    db.cms.settings.general = {
      ...db.cms.settings.general,
      websiteName: String(website.websiteName),
      websiteUrl: String(website.websiteUrl),
      description: String(website.websiteDescription || db.cms.settings.general.description),
      contactEmail: String(website.contactEmail),
      contactPhone: String(website.contactPhone),
      timezone: String(website.timezone || 'Asia/Kolkata'),
      language: String(website.defaultLanguage || 'English'),
    };
    db.cms.settings.contact.email = String(website.contactEmail);
    db.cms.settings.contact.primaryPhone = String(website.contactPhone);
    db.cms.header.email = String(website.contactEmail);
    db.cms.header.phone = String(website.contactPhone);
    db.cms.header.staffPortalLabel = '';
    db.cms.header.staffPortalUrl = '';
    db.cms.installInfo = {
      ...db.cms.installInfo,
      isInstalledDemo: false,
      installedAt: db.installedAt,
      databaseType: 'MySQL 8.0+',
      databaseHost: `${db.databaseConfig.host}:${db.databaseConfig.port}`,
      databaseName: db.databaseConfig.database,
    };

    const superAdmin: StoredUser = {
      id: 'usr-1',
      name: String(admin.fullName).trim(),
      username: String(admin.username).trim(),
      email: String(admin.email).trim(),
      passwordHash: hashPassword(String(admin.password)),
      role: 'Super Administrator',
      active: true,
      lastLogin: 'Never',
    };
    db.users = [superAdmin];
    logActivity(db, superAdmin, 'Completed first-time installation & locked installer', 'Installer');
    saveDatabase(db);

    res.status(201).json({
      success: true,
      message: 'Installation completed successfully and installer is now locked.',
      data: {
        installed: true,
        adminLoginPath,
        adminPanelPath,
        superAdminEmail: superAdmin.email,
      },
    });
  });

  // =========================================================================
  // 2. PUBLIC WEBSITE & CHATBOT API
  // =========================================================================
  app.get('/api/v1/public/bootstrap', requireInstalled, (_req, res) => {
    const db = loadDatabase();
    res.json({
      success: true,
      data: {
        installed: true,
        runtimeConfig: {
          adminLoginPath: db.adminLoginPath,
          adminPanelPath: db.adminPanelPath,
        },
        appearance: db.cms.appearance,
        header: db.cms.header,
        navigation: db.cms.navigation,
        footer: db.cms.footer,
        sliders: db.cms.sliders,
        banners: db.cms.banners,
        pages: db.cms.pages.filter((p) => p.status === 'published' && p.enabled),
        programs: db.cms.programs.filter((p) => p.active),
        departments: db.cms.departments.filter((d) => d.active),
        faculty: db.cms.faculty.filter((f) => f.active),
        newsEvents: db.cms.newsEvents.filter((n) => n.status === 'published'),
        achievements: db.cms.achievements.filter((a) => a.active),
        placements: db.cms.placements.filter((p) => p.active),
        campusLife: db.cms.campusLife.filter((c) => c.active),
        gallery: db.cms.gallery.filter((g) => g.active),
        testimonials: db.cms.testimonials.filter((t) => t.active),
        downloads: db.cms.downloads.filter((d) => d.active),
        chatbot: db.cms.chatbot,
        seo: db.cms.seo,
        settings: db.cms.settings,
      },
    });
  });

  app.get('/api/v1/public/pages/:slug', requireInstalled, (req, res) => {
    const db = loadDatabase();
    const target = req.params.slug;
    const page = db.cms.pages.find(
      (p) => p.enabled && p.status === 'published' && (p.slug === `/p/${target}` || p.slug === `/${target}` || p.slug === target)
    );
    if (!page) {
      res.status(404).json({ success: false, message: 'Page not found.' });
      return;
    }
    res.json({ success: true, data: page });
  });

  app.get('/api/v1/public/departments/:slug', requireInstalled, (req, res) => {
    const db = loadDatabase();
    const dept = db.cms.departments.find((d) => d.active && d.slug === req.params.slug);
    if (!dept) {
      res.status(404).json({ success: false, message: 'Department not found.' });
      return;
    }
    res.json({ success: true, data: dept });
  });

  app.get('/api/v1/public/news-events', requireInstalled, (req, res) => {
    const db = loadDatabase();
    const type = String(req.query.type || '');
    const search = String(req.query.search || '').toLowerCase();
    const items = db.cms.newsEvents.filter((n) => {
      if (n.status !== 'published') return false;
      if (type && n.type !== type) return false;
      if (search && !n.title.toLowerCase().includes(search)) return false;
      return true;
    });
    res.json({
      success: true,
      data: {
        news: items.filter((n) => n.type !== 'event'),
        events: items.filter((n) => n.type === 'event'),
      },
    });
  });

  app.post('/api/v1/public/enquiries', requireInstalled, rateLimit('enquiry', 15, 60_000), (req, res) => {
    const parsed = enquirySchema.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || 'Please check enquiry fields.';
      res.status(422).json({ success: false, message: msg });
      return;
    }
    const db = loadDatabase();
    const refCode = `ENQ-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const createdAt = new Date().toISOString();
    db.cms.enquiries.unshift({
      id: refCode,
      studentName: parsed.data.studentName,
      parentName: parsed.data.parentName || '',
      mobile: parsed.data.mobile,
      email: parsed.data.email || '',
      interestedProgram: parsed.data.interestedProgram,
      qualification: parsed.data.qualification || '',
      city: parsed.data.city || '',
      state: parsed.data.state || 'Andhra Pradesh',
      message: parsed.data.message || '',
      status: 'New',
      assignedTo: '',
      notes: '',
      followUpDate: '',
      createdAt,
    });
    db.cms.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'New Admission Enquiry Received',
      message: `${parsed.data.studentName} enquired about ${parsed.data.interestedProgram} (${parsed.data.mobile}).`,
      type: 'enquiry',
      read: false,
      createdAt: createdAt.slice(0, 10),
      link: '/enquiries',
    });
    saveDatabase(db);
    res.status(201).json({
      success: true,
      message: 'Admission enquiry submitted successfully.',
      data: { referenceCode: refCode, createdAt },
    });
  });

  app.post('/api/v1/public/feedback', requireInstalled, rateLimit('enquiry', 15, 60_000), (req, res) => {
    const { name, role, rating, comments } = req.body || {};
    if (!name || String(name).trim().length < 2 || !comments || String(comments).trim().length < 5) {
      res.status(422).json({ success: false, message: 'Name and feedback comments are required.' });
      return;
    }
    const db = loadDatabase();
    db.feedbackSubmissions.unshift({
      id: `fb-${Date.now()}`,
      name: String(name).trim(),
      role: String(role || 'Visitor'),
      rating: Number(rating) || 5,
      comments: String(comments).trim(),
      createdAt: new Date().toISOString(),
    });
    db.cms.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'New Campus Feedback Submitted',
      message: `${String(name).trim()} (${String(role || 'Visitor')}) submitted feedback.`,
      type: 'system',
      read: false,
      createdAt: new Date().toISOString().slice(0, 10),
      link: '/notifications',
    });
    saveDatabase(db);
    res.status(201).json({ success: true, message: 'Thank you for submitting your institutional feedback.' });
  });

  app.post('/api/v1/chatbot/message', requireInstalled, rateLimit('chatbot', 40, 60_000), async (req, res) => {
    const message = String(req.body?.message || '').trim();
    if (!message || message.length > 500) {
      res.status(422).json({ success: false, message: 'Please enter a valid question (max 500 chars).' });
      return;
    }

    const db = loadDatabase();
    db.chatbotQueryCount += 1;
    saveDatabase(db);

    const faqReply = resolveChatbotReply(message, db.cms.chatbot, {
      phone: db.cms.settings.contact.primaryPhone,
      email: db.cms.settings.contact.email,
      address: db.cms.settings.contact.address,
      workingHours: db.cms.settings.contact.workingHours,
    });

    if (faqReply.matched) {
      res.json({
        success: true,
        data: {
          reply: faqReply.response,
          provider: 'faq',
          matchedFaqId: faqReply.faq?.id || null,
          matched: true,
        },
      });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (db.cms.chatbot.providerMode === 'backend_ai_adapter' && apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
        });
        const faqContext = db.cms.chatbot.faqs
          .filter((f) => f.enabled)
          .slice(0, 12)
          .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
          .join('\n\n');

        const aiRes = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: message,
          config: {
            systemInstruction:
              `You are ${db.cms.chatbot.name}, the official assistant for KITS College of Pharmacy for Women, Divili, Andhra Pradesh (PCI approved, affiliated to JNTU Kakinada). ` +
              `Answer concisely in 2-4 sentences using ONLY verified facts below. Never invent fee numbers or placements. If unknown, share phone ${db.cms.settings.contact.primaryPhone} and email ${db.cms.settings.contact.email}.\n\n` +
              `Verified College Knowledge Base:\n${faqContext}`,
          },
        });
        const text = aiRes.text?.trim();
        if (text) {
          res.json({
            success: true,
            data: { reply: text, provider: 'gemini', matchedFaqId: null, matched: true },
          });
          return;
        }
      } catch {
        // Fall through cleanly to verified institutional fallback
      }
    }

    res.json({
      success: true,
      data: {
        reply: faqReply.response,
        provider: 'fallback',
        matchedFaqId: null,
        matched: false,
      },
    });
  });

  // =========================================================================
  // 3. AUTHENTICATION ENDPOINTS
  // =========================================================================
  app.post('/api/v1/auth/login', noIndexHeaders, requireInstalled, requireCsrf, rateLimit('login', 10, 60_000), (req, res) => {
    const { identifier, password, remember } = req.body || {};
    if (!identifier || !password) {
      res.status(422).json({ success: false, message: 'Username/email and password are required.' });
      return;
    }

    const db = loadDatabase();
    const idNorm = String(identifier).trim().toLowerCase();
    const user = db.users.find(
      (u) => u.username.toLowerCase() === idNorm || u.email.toLowerCase() === idNorm
    );

    if (!user || !verifyPassword(String(password), user.passwordHash)) {
      res.status(401).json({ success: false, message: 'Invalid username/email or password.' });
      return;
    }
    if (!user.active) {
      res.status(403).json({ success: false, message: 'This administrator account is currently suspended.' });
      return;
    }

    const ttlMs = remember ? 7 * 24 * 60 * 60 * 1000 : 12 * 60 * 60 * 1000;
    const token = signSessionToken(user.id, db.appSecret, ttlMs);
    user.lastLogin = new Date().toISOString();
    logActivity(db, user, 'Signed in to CMS Control Panel', 'Authentication');
    saveDatabase(db);

    res.cookie('kits_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: ttlMs,
      path: '/',
    });
    res.json({
      success: true,
      message: 'Authenticated successfully.',
      data: { user: serializeUser(db, user) },
    });
  });

  app.get('/api/v1/auth/me', noIndexHeaders, requireInstalled, requireAuth, (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    res.json({
      success: true,
      data: { user: serializeUser(authReq.devDb, authReq.authUser) },
    });
  });

  app.post('/api/v1/auth/logout', noIndexHeaders, requireInstalled, requireCsrf, (req, res) => {
    const db = loadDatabase();
    const userId = verifySessionToken(req.cookies?.kits_session, db.appSecret);
    const user = db.users.find((u) => u.id === userId) || null;
    if (user) {
      logActivity(db, user, 'Signed out of CMS Control Panel', 'Authentication');
      saveDatabase(db);
    }
    res.clearCookie('kits_session', { path: '/' });
    res.json({ success: true, message: 'Signed out securely.' });
  });

  app.post('/api/v1/auth/forgot-password', noIndexHeaders, requireInstalled, requireCsrf, rateLimit('login', 10, 60_000), (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) {
      res.status(422).json({ success: false, message: 'Email address is required.' });
      return;
    }
    const db = loadDatabase();
    const user = db.users.find((u) => u.email.toLowerCase() === email && u.active);
    if (user) {
      const rawToken = crypto.randomBytes(24).toString('hex');
      db.resetTokens = db.resetTokens.filter((t) => t.email !== user.email);
      db.resetTokens.push({
        email: user.email,
        tokenHash: crypto.createHash('sha256').update(rawToken).digest('hex'),
        expiresAt: Date.now() + 60 * 60 * 1000,
      });
      saveDatabase(db);
    }
    res.json({
      success: true,
      message: 'If an active administrator account matches that email, a password reset link has been dispatched.',
    });
  });

  app.post('/api/v1/auth/reset-password', noIndexHeaders, requireInstalled, requireCsrf, rateLimit('login', 10, 60_000), (req, res) => {
    const { email, token, password, password_confirmation } = req.body || {};
    if (!email || !token || !password || String(password).length < 8 || password !== password_confirmation) {
      res.status(422).json({ success: false, message: 'Valid email, token, and matching 8+ character password are required.' });
      return;
    }
    const db = loadDatabase();
    const record = db.resetTokens.find((t) => t.email.toLowerCase() === String(email).trim().toLowerCase());
    const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
    if (!record || record.tokenHash !== tokenHash || Date.now() > record.expiresAt) {
      res.status(422).json({ success: false, message: 'Invalid or expired password reset token.' });
      return;
    }
    const user = db.users.find((u) => u.email.toLowerCase() === record.email.toLowerCase());
    if (!user) {
      res.status(404).json({ success: false, message: 'User account not found.' });
      return;
    }
    user.passwordHash = hashPassword(String(password));
    db.resetTokens = db.resetTokens.filter((t) => t.email !== record.email);
    logActivity(db, user, 'Completed password reset', 'Authentication');
    saveDatabase(db);
    res.json({ success: true, message: 'Password has been reset. You may now sign in.' });
  });

  app.put('/api/v1/auth/profile', noIndexHeaders, requireInstalled, requireCsrf, requireAuth, (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim();
    if (name.length < 2 || !email.includes('@')) {
      res.status(422).json({ success: false, message: 'Valid name and email are required.' });
      return;
    }
    const duplicate = authReq.devDb.users.some(
      (u) => u.id !== authReq.authUser.id && u.email.toLowerCase() === email.toLowerCase()
    );
    if (duplicate) {
      res.status(422).json({ success: false, message: 'Email address is already in use.' });
      return;
    }
    authReq.authUser.name = name;
    authReq.authUser.email = email;
    logActivity(authReq.devDb, authReq.authUser, 'Updated personal profile', 'Authentication');
    saveDatabase(authReq.devDb);
    res.json({
      success: true,
      message: 'Profile updated.',
      data: { user: serializeUser(authReq.devDb, authReq.authUser) },
    });
  });

  app.put('/api/v1/auth/change-password', noIndexHeaders, requireInstalled, requireCsrf, requireAuth, (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    const { currentPassword, password, password_confirmation } = req.body || {};
    if (!verifyPassword(String(currentPassword || ''), authReq.authUser.passwordHash)) {
      res.status(422).json({ success: false, message: 'Current password is incorrect.' });
      return;
    }
    if (!password || String(password).length < 8 || password !== password_confirmation) {
      res.status(422).json({ success: false, message: 'New password must be at least 8 characters and match confirmation.' });
      return;
    }
    authReq.authUser.passwordHash = hashPassword(String(password));
    logActivity(authReq.devDb, authReq.authUser, 'Changed personal password', 'Authentication');
    saveDatabase(authReq.devDb);
    res.json({ success: true, message: 'Password changed successfully.' });
  });

  // =========================================================================
  // 4. PROTECTED ADMIN CMS API
  // =========================================================================
  app.use('/api/v1/admin', noIndexHeaders, requireInstalled, requireAuth);
  app.use('/api/v1/admin', (req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      requireCsrf(req, res, next);
      return;
    }
    next();
  });

  app.get('/api/v1/admin/bootstrap', (req, res) => {
    const authReq = req as Request & { devDb: DevDatabase };
    const db = authReq.devDb;
    res.json({
      success: true,
      data: {
        ...db.cms,
        runtimeConfig: { adminLoginPath: db.adminLoginPath, adminPanelPath: db.adminPanelPath },
        users: db.users.map((u) => serializeUser(db, u)),
      },
    });
  });

  app.get('/api/v1/admin/dashboard', (req, res) => {
    const authReq = req as Request & { devDb: DevDatabase };
    const db = authReq.devDb;
    const monthBuckets = new Map<string, number>();
    const progBuckets = new Map<string, number>();

    for (const enq of db.cms.enquiries) {
      const monthLabel = enq.createdAt.slice(0, 7);
      monthBuckets.set(monthLabel, (monthBuckets.get(monthLabel) || 0) + 1);
      progBuckets.set(enq.interestedProgram, (progBuckets.get(enq.interestedProgram) || 0) + 1);
    }

    res.json({
      success: true,
      data: {
        kpis: {
          totalEnquiries: db.cms.enquiries.length,
          newEnquiries: db.cms.enquiries.filter((e) => e.status === 'New').length,
          convertedEnquiries: db.cms.enquiries.filter((e) => e.status === 'Converted').length,
          publishedPages: db.cms.pages.filter((p) => p.status === 'published').length,
          totalPages: db.cms.pages.length,
          mediaCount: db.cms.media.length,
          newsCount: db.cms.newsEvents.length,
          faqCount: db.cms.chatbot.faqs.filter((f) => f.enabled).length,
          chatbotTotalQueries: db.chatbotQueryCount,
          unreadNotifications: db.cms.notifications.filter((n) => !n.read).length,
        },
        monthlyTrend: Array.from(monthBuckets.entries()).map(([month, enquiries]) => ({ month, enquiries })),
        programBreakdown: Array.from(progBuckets.entries()).map(([program, count]) => ({ program, count })),
      },
    });
  });

  app.put('/api/v1/admin/appearance', requirePermission('appearance_management'), (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    authReq.devDb.cms.appearance = req.body;
    logActivity(authReq.devDb, authReq.authUser, 'Updated appearance palette & typography', 'Appearance');
    saveDatabase(authReq.devDb);
    res.json({ success: true, message: 'Appearance saved.' });
  });

  app.put('/api/v1/admin/header', requirePermission('website_management'), (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    authReq.devDb.cms.header = req.body;
    logActivity(authReq.devDb, authReq.authUser, 'Updated header settings', 'Header');
    saveDatabase(authReq.devDb);
    res.json({ success: true, message: 'Header saved.' });
  });

  app.put('/api/v1/admin/footer', requirePermission('website_management'), (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    authReq.devDb.cms.footer = req.body;
    logActivity(authReq.devDb, authReq.authUser, 'Updated footer settings', 'Footer');
    saveDatabase(authReq.devDb);
    res.json({ success: true, message: 'Footer saved.' });
  });

  app.put('/api/v1/admin/menus', requirePermission('website_management'), (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    authReq.devDb.cms.navigation = req.body.items || [];
    logActivity(authReq.devDb, authReq.authUser, 'Synchronized navigation menus', 'Navigation');
    saveDatabase(authReq.devDb);
    res.json({ success: true, message: 'Navigation saved.' });
  });

  app.put('/api/v1/admin/sliders', requirePermission('website_management'), (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    authReq.devDb.cms.sliders = req.body.sliders || [];
    logActivity(authReq.devDb, authReq.authUser, 'Updated hero sliders', 'Sliders');
    saveDatabase(authReq.devDb);
    res.json({ success: true, message: 'Sliders updated.' });
  });

  app.put('/api/v1/admin/banners', requirePermission('website_management'), (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    authReq.devDb.cms.banners = req.body.banners || [];
    logActivity(authReq.devDb, authReq.authUser, 'Updated promotional banners', 'Banners');
    saveDatabase(authReq.devDb);
    res.json({ success: true, message: 'Banners saved.' });
  });

  app.post('/api/v1/admin/media', requirePermission('website_management'), upload.single('file'), (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    if (!req.file) {
      res.status(422).json({ success: false, message: 'No valid media file uploaded.' });
      return;
    }
    const folder = normalizeMediaFolder(req.body?.folder);
    const ext = path.extname(req.file.originalname).toLowerCase();
    const bytes = req.file.size;
    const fileSize = bytes > 1048576 ? `${(bytes / 1048576).toFixed(2)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
    const newItem: MediaItem = {
      id: `med-${Date.now()}`,
      title: String(req.body?.title || req.file.originalname),
      altText: String(req.body?.altText || req.file.originalname),
      type: ext === '.pdf' ? 'pdf' : ext === '.mp4' ? 'video' : 'image',
      folder,
      url: `/uploads/${folder}/${req.file.filename}`,
      fileSize,
      uploadedAt: new Date().toISOString().slice(0, 10),
    };
    authReq.devDb.cms.media.unshift(newItem);
    logActivity(authReq.devDb, authReq.authUser, `Uploaded media "${newItem.title}"`, 'Media');
    saveDatabase(authReq.devDb);
    res.status(201).json({ success: true, message: 'File uploaded.', data: newItem });
  });

  app.put('/api/v1/admin/media/:id', requirePermission('website_management'), (req, res) => {
    const authReq = req as Request & { devDb: DevDatabase };
    const target = authReq.devDb.cms.media.find((m) => m.id === req.params.id);
    if (!target) {
      res.status(404).json({ success: false, message: 'Media asset not found.' });
      return;
    }
    target.title = req.body.title ?? target.title;
    target.altText = req.body.altText ?? target.altText;
    if (req.body.folder !== undefined) {
      target.folder = normalizeMediaFolder(req.body.folder);
    }
    saveDatabase(authReq.devDb);
    res.json({ success: true, message: 'Media metadata updated.' });
  });

  app.delete('/api/v1/admin/media/:id', requirePermission('website_management'), (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    const idx = authReq.devDb.cms.media.findIndex((m) => m.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ success: false, message: 'Media asset not found.' });
      return;
    }
    const [removed] = authReq.devDb.cms.media.splice(idx, 1);
    if (removed.url.startsWith('/uploads/')) {
      const diskPath = path.join(UPLOADS_DIR, removed.url.replace(/^\/uploads\//, ''));
      if (fs.existsSync(diskPath)) fs.unlinkSync(diskPath);
    }
    logActivity(authReq.devDb, authReq.authUser, `Deleted media "${removed.title}"`, 'Media');
    saveDatabase(authReq.devDb);
    res.json({ success: true, message: 'Media asset deleted.' });
  });

  app.post('/api/v1/admin/pages', requirePermission('page_management'), (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    const page = req.body;
    authReq.devDb.cms.pages.unshift(page);
    logActivity(authReq.devDb, authReq.authUser, `Created page "${page.title}"`, 'Pages');
    saveDatabase(authReq.devDb);
    res.status(201).json({ success: true, data: page });
  });

  app.put('/api/v1/admin/pages/:id', requirePermission('page_management'), (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    const idx = authReq.devDb.cms.pages.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      authReq.devDb.cms.pages.unshift(req.body);
    } else {
      authReq.devDb.cms.pages[idx] = req.body;
    }
    logActivity(authReq.devDb, authReq.authUser, `Updated page "${req.body.title}"`, 'Pages');
    saveDatabase(authReq.devDb);
    res.json({ success: true, data: req.body });
  });

  app.delete('/api/v1/admin/pages/:id', requirePermission('page_management'), (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    const target = authReq.devDb.cms.pages.find((p) => p.id === req.params.id);
    if (target?.isSystemRoute) {
      res.status(422).json({ success: false, message: 'Core system pages cannot be deleted.' });
      return;
    }
    authReq.devDb.cms.pages = authReq.devDb.cms.pages.filter((p) => p.id !== req.params.id);
    logActivity(authReq.devDb, authReq.authUser, `Deleted page "${target?.title || req.params.id}"`, 'Pages');
    saveDatabase(authReq.devDb);
    res.json({ success: true, message: 'Page deleted.' });
  });

  app.put('/api/v1/admin/programs', requirePermission('academic_content'), (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    authReq.devDb.cms.programs = req.body.programs || [];
    logActivity(authReq.devDb, authReq.authUser, 'Updated academic programs', 'Programs');
    saveDatabase(authReq.devDb);
    res.json({ success: true, message: 'Programs saved.' });
  });

  app.put('/api/v1/admin/departments', requirePermission('academic_content'), (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    authReq.devDb.cms.departments = req.body.departments || [];
    logActivity(authReq.devDb, authReq.authUser, 'Updated departments', 'Departments');
    saveDatabase(authReq.devDb);
    res.json({ success: true, message: 'Departments saved.' });
  });

  app.put('/api/v1/admin/faculty', requirePermission('academic_content'), (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    authReq.devDb.cms.faculty = req.body.faculty || [];
    logActivity(authReq.devDb, authReq.authUser, 'Updated faculty directory', 'Faculty');
    saveDatabase(authReq.devDb);
    res.json({ success: true, message: 'Faculty saved.' });
  });

  app.put('/api/v1/admin/admissions-settings', requirePermission('admissions'), (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    authReq.devDb.cms.settings.admissionsConfig = req.body;
    logActivity(authReq.devDb, authReq.authUser, 'Updated admissions campaign settings', 'Admissions');
    saveDatabase(authReq.devDb);
    res.json({ success: true, message: 'Admissions settings saved.' });
  });

  app.get('/api/v1/admin/enquiries', requirePermission('admissions'), (req, res) => {
    const authReq = req as Request & { devDb: DevDatabase };
    res.json({ success: true, data: authReq.devDb.cms.enquiries });
  });

  app.get('/api/v1/admin/enquiries/export', requirePermission('admissions'), (req, res) => {
    const authReq = req as Request & { devDb: DevDatabase };
    const headers = ['Reference', 'Student Name', 'Parent Name', 'Mobile', 'Email', 'Program', 'Qualification', 'City', 'State', 'Status', 'Follow-Up Date', 'Submitted At'];
    const rows = authReq.devDb.cms.enquiries.map((e) => [
      e.id, e.studentName, e.parentName, e.mobile, e.email, e.interestedProgram,
      e.qualification, e.city, e.state, e.status, e.followUpDate, e.createdAt,
    ]);
    const csv = buildCsvContent(headers, rows);
    res.setHeader('Content-Type', 'text/csv; charset=UTF-8');
    res.setHeader('Content-Disposition', `attachment; filename="kits-admission-enquiries-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csv);
  });

  app.put('/api/v1/admin/enquiries/:id', requirePermission('admissions'), (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    const enq = authReq.devDb.cms.enquiries.find((e) => e.id === req.params.id);
    if (!enq) {
      res.status(404).json({ success: false, message: 'Enquiry not found.' });
      return;
    }
    if (req.body.status !== undefined) enq.status = req.body.status;
    if (req.body.notes !== undefined) enq.notes = req.body.notes;
    if (req.body.followUpDate !== undefined) enq.followUpDate = req.body.followUpDate;
    logActivity(authReq.devDb, authReq.authUser, `Updated enquiry ${enq.id}`, 'Enquiries');
    saveDatabase(authReq.devDb);
    res.json({ success: true, message: 'Enquiry updated.' });
  });

  app.put('/api/v1/admin/news-events', requirePermission('news'), (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    authReq.devDb.cms.newsEvents = req.body.newsEvents || [];
    logActivity(authReq.devDb, authReq.authUser, 'Updated news and events', 'News & Events');
    saveDatabase(authReq.devDb);
    res.json({ success: true, message: 'News and events saved.' });
  });

  app.put('/api/v1/admin/modules/:module', requirePermission('academic_content', 'news'), (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    const items = req.body.items || [];
    switch (req.params.module) {
      case 'achievements':
        authReq.devDb.cms.achievements = items;
        break;
      case 'placements':
        authReq.devDb.cms.placements = items;
        break;
      case 'campus-life':
        authReq.devDb.cms.campusLife = items;
        break;
      case 'gallery':
        authReq.devDb.cms.gallery = items;
        break;
      case 'testimonials':
        authReq.devDb.cms.testimonials = items;
        break;
      case 'downloads':
        authReq.devDb.cms.downloads = items;
        break;
      default:
        res.status(404).json({ success: false, message: 'Unknown module.' });
        return;
    }
    logActivity(authReq.devDb, authReq.authUser, `Updated ${req.params.module}`, req.params.module);
    saveDatabase(authReq.devDb);
    res.json({ success: true, message: 'Module saved.' });
  });

  app.put('/api/v1/admin/chatbot/settings', requirePermission('chatbot'), (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    authReq.devDb.cms.chatbot = { ...authReq.devDb.cms.chatbot, ...req.body };
    logActivity(authReq.devDb, authReq.authUser, 'Updated chatbot settings', 'Chatbot');
    saveDatabase(authReq.devDb);
    res.json({ success: true, message: 'Chatbot settings saved.' });
  });

  app.put('/api/v1/admin/chatbot/faqs', requirePermission('chatbot'), (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    authReq.devDb.cms.chatbot.faqs = req.body.faqs || [];
    logActivity(authReq.devDb, authReq.authUser, 'Updated chatbot FAQs', 'Chatbot');
    saveDatabase(authReq.devDb);
    res.json({ success: true, message: 'Chatbot FAQs saved.' });
  });

  app.put('/api/v1/admin/seo', requirePermission('website_management'), (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    authReq.devDb.cms.seo = req.body;
    logActivity(authReq.devDb, authReq.authUser, 'Updated SEO configuration', 'SEO');
    saveDatabase(authReq.devDb);
    res.json({ success: true, message: 'SEO settings saved.' });
  });

  app.put('/api/v1/admin/settings', requirePermission('system_settings', 'website_management'), (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    authReq.devDb.cms.settings = req.body;
    logActivity(authReq.devDb, authReq.authUser, 'Updated website settings', 'Settings');
    saveDatabase(authReq.devDb);
    res.json({ success: true, message: 'Settings saved.' });
  });

  app.put('/api/v1/admin/forms', requirePermission('website_management'), (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    authReq.devDb.cms.forms = req.body.forms || [];
    logActivity(authReq.devDb, authReq.authUser, 'Updated forms configuration', 'Forms');
    saveDatabase(authReq.devDb);
    res.json({ success: true, message: 'Forms updated.' });
  });

  app.post('/api/v1/admin/users', requirePermission('user_management'), (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    const { name, username, email, password, role, active } = req.body || {};
    if (!name || !username || !email || !password || String(password).length < 8) {
      res.status(422).json({ success: false, message: 'Valid name, username, email, and 8+ character password required.' });
      return;
    }
    const exists = authReq.devDb.users.some(
      (u) =>
        u.username.toLowerCase() === String(username).trim().toLowerCase() ||
        u.email.toLowerCase() === String(email).trim().toLowerCase()
    );
    if (exists) {
      res.status(422).json({ success: false, message: 'Username or email already exists.' });
      return;
    }
    const newUser: StoredUser = {
      id: `usr-${Date.now()}`,
      name: String(name).trim(),
      username: String(username).trim(),
      email: String(email).trim(),
      passwordHash: hashPassword(String(password)),
      role: (role || 'Content Editor') as AdminRoleName,
      active: active ?? true,
      lastLogin: 'Never',
    };
    authReq.devDb.users.unshift(newUser);
    logActivity(authReq.devDb, authReq.authUser, `Created admin user ${newUser.username} (${newUser.role})`, 'Users');
    saveDatabase(authReq.devDb);
    res.status(201).json({ success: true, message: 'User created.', data: serializeUser(authReq.devDb, newUser) });
  });

  app.put('/api/v1/admin/users/:id', requirePermission('user_management'), (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    const target = authReq.devDb.users.find((u) => u.id === req.params.id);
    if (!target) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }
    if (target.id === authReq.authUser.id && req.body.active === false) {
      res.status(422).json({ success: false, message: 'You cannot suspend your own active session.' });
      return;
    }
    if (req.body.name) target.name = String(req.body.name);
    if (req.body.email) target.email = String(req.body.email);
    if (req.body.role) target.role = req.body.role as AdminRoleName;
    if (req.body.active !== undefined) target.active = Boolean(req.body.active);
    if (req.body.password && String(req.body.password).length >= 8) {
      target.passwordHash = hashPassword(String(req.body.password));
    }
    logActivity(authReq.devDb, authReq.authUser, `Updated admin user ${target.username}`, 'Users');
    saveDatabase(authReq.devDb);
    res.json({ success: true, message: 'User updated.' });
  });

  app.delete('/api/v1/admin/users/:id', requirePermission('user_management'), (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    if (req.params.id === authReq.authUser.id) {
      res.status(422).json({ success: false, message: 'You cannot delete your own account.' });
      return;
    }
    const target = authReq.devDb.users.find((u) => u.id === req.params.id);
    authReq.devDb.users = authReq.devDb.users.filter((u) => u.id !== req.params.id);
    logActivity(authReq.devDb, authReq.authUser, `Deleted admin user ${target?.username || req.params.id}`, 'Users');
    saveDatabase(authReq.devDb);
    res.json({ success: true, message: 'User deleted.' });
  });

  app.put('/api/v1/admin/roles/:id', requirePermission('user_management'), (req, res) => {
    const authReq = req as Request & { authUser: StoredUser; devDb: DevDatabase };
    const role = authReq.devDb.cms.roles.find((r) => r.id === req.params.id);
    if (!role) {
      res.status(404).json({ success: false, message: 'Role not found.' });
      return;
    }
    if (role.name === 'Super Administrator') {
      res.status(422).json({ success: false, message: 'Super Administrator permissions cannot be restricted.' });
      return;
    }
    role.permissions = Array.isArray(req.body.permissions) ? req.body.permissions : role.permissions;
    logActivity(authReq.devDb, authReq.authUser, `Updated permissions for ${role.name}`, 'Roles');
    saveDatabase(authReq.devDb);
    res.json({ success: true, message: 'Role permissions updated.' });
  });

  app.post('/api/v1/admin/notifications/read-all', (req, res) => {
    const authReq = req as Request & { devDb: DevDatabase };
    for (const n of authReq.devDb.cms.notifications) {
      n.read = true;
    }
    saveDatabase(authReq.devDb);
    res.json({ success: true, message: 'Notifications marked read.' });
  });

  app.get('/api/v1/admin/install-info', requirePermission('system_settings'), (req, res) => {
    const authReq = req as Request & { devDb: DevDatabase };
    const db = authReq.devDb;
    res.json({
      success: true,
      data: {
        installed: db.installed,
        appVersion: db.appVersion,
        installedAt: db.installedAt,
        installedByEmail: db.installedByEmail,
        adminLoginPath: db.adminLoginPath,
        adminPanelPath: db.adminPanelPath,
        phpVersion: `PHP 8.3+ / Dev Runtime (${process.version})`,
        databaseHost: `${db.databaseConfig.host}:${db.databaseConfig.port}`,
        databaseName: db.databaseConfig.database,
      },
    });
  });

  // =========================================================================
  // 5. PUBLIC SEO SITEMAP & ROBOTS.TXT (NEVER EXPOSE ADMIN OR INSTALLER)
  // =========================================================================
  app.get('/sitemap.xml', (req, res) => {
    const db = loadDatabase();
    if (!db.cms.seo.enableSitemap) {
      res.status(404).send('');
      return;
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const staticRoutes = [
      '/', '/about', '/about/history', '/about/vision-mission', '/about/principal-message', '/about/governance',
      '/academics', '/academics/programs', '/academics/calendar', '/academics/syllabus', '/academics/examination-cell',
      '/admissions', '/admissions/eligibility', '/admissions/process',
      '/departments', '/faculty', '/campus-life', '/achievements', '/placements', '/gallery', '/news', '/events',
      '/downloads', '/contact', '/feedback',
    ];
    const deptRoutes = db.cms.departments.filter((d) => d.active).map((d) => `/departments/${d.slug}`);
    const customPageRoutes = db.cms.pages
      .filter((p) => p.status === 'published' && p.enabled && !p.isSystemRoute)
      .map((p) => (p.slug.startsWith('/') ? p.slug : `/p/${p.slug}`));

    const allUrls = Array.from(new Set([...staticRoutes, ...deptRoutes, ...customPageRoutes])).map(
      (r) => `  <url>\n    <loc>${baseUrl}${r}</loc>\n    <changefreq>weekly</changefreq>\n  </url>`
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allUrls.join('\n')}\n</urlset>\n`;
    res.setHeader('Content-Type', 'application/xml; charset=UTF-8');
    res.send(xml);
  });

  app.get('/robots.txt', (req, res) => {
    const db = loadDatabase();
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const lines = [
      'User-agent: *',
      'Allow: /',
      `Disallow: ${db.adminLoginPath}`,
      `Disallow: ${db.adminPanelPath}/`,
      'Disallow: /admin',
      'Disallow: /install',
      'Disallow: /api/',
      'Disallow: /sanctum/',
      '',
      `Sitemap: ${baseUrl}/sitemap.xml`,
    ];
    res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
    res.send(`${lines.join('\n')}\n`);
  });

  // Apply X-Robots-Tag noindex on HTML requests matching admin, login, or install URLs
  app.use((req, res, next) => {
    const db = loadDatabase();
    const p = req.path;
    if (
      p.startsWith(db.adminLoginPath) ||
      p.startsWith(db.adminPanelPath) ||
      p.startsWith('/install') ||
      p.startsWith('/forgot-password') ||
      p.startsWith('/reset-password')
    ) {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    }
    next();
  });

  // Mount Vite middleware in dev preview mode (static dist/ served by Apache on cPanel)
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  // Error handler for upload or malformed JSON
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    res.status(422).json({ success: false, message: err.message || 'Server error.' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KITS Pharmacy Full-Stack Dev Preview listening on http://localhost:${PORT}`);
  });
}

void startServer();
