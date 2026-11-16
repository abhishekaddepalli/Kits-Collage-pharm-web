import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Database,
  Globe,
  Loader2,
  Lock,
  Server,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  XCircle,
} from 'lucide-react';
import { useCms } from '../../app/providers/CmsContext';
import { KitsLogo } from '../../components/common/KitsLogo';
import { SeoHead } from '../../components/common/SeoHead';
import { PRESET_THEMES } from '../../data/defaults/kitsSeedData';
import {
  installService,
  type AdminSetupInput,
  type DatabaseConfigInput,
  type ServerRequirementItem,
  type WebsiteInstallConfigInput,
} from '../../services/installation/installService';
import { evaluatePasswordStrength } from '../../utils/validation';

const STEPS = [
  { id: 1, label: 'Welcome', path: '/install' },
  { id: 2, label: 'Requirements', path: '/install/requirements' },
  { id: 3, label: 'Database', path: '/install/database' },
  { id: 4, label: 'Website', path: '/install/website' },
  { id: 5, label: 'Administrator', path: '/install/admin' },
  { id: 6, label: 'Summary', path: '/install/summary' },
  { id: 7, label: 'Complete', path: '/install/complete' },
];

function sanitizePathInput(value: string, fallback: string): string {
  const clean = value.trim().replace(/\/+/g, '/');
  if (!clean) return fallback;
  const withSlash = clean.startsWith('/') ? clean : `/${clean}`;
  return withSlash.length > 1 ? withSlash.replace(/\/$/, '') : fallback;
}

export const InstallWizardPage: React.FC = () => {
  const { state, refreshBootstrap } = useCms();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const currentStep = useMemo(() => {
    const found = STEPS.find((s) => s.path === pathname);
    return found ? found.id : 1;
  }, [pathname]);

  const [checkingStatus, setCheckingStatus] = useState(true);
  const [alreadyInstalled, setAlreadyInstalled] = useState(false);
  const [completedPaths, setCompletedPaths] = useState<{ login: string; panel: string } | null>(null);

  const [requirements, setRequirements] = useState<ServerRequirementItem[]>([]);
  const [allReqsPassed, setAllReqsPassed] = useState(true);
  const [loadingReqs, setLoadingReqs] = useState(false);

  const [dbConfig, setDbConfig] = useState<DatabaseConfigInput>({
    dbType: 'MySQL',
    host: 'localhost',
    port: '3306',
    database: 'kits_pharmacy_cms',
    username: '',
    password: '',
  });
  const [dbTesting, setDbTesting] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [siteConfig, setSiteConfig] = useState<WebsiteInstallConfigInput>({
    websiteName: state.settings.general.websiteName || 'KITS College of Pharmacy for Women',
    websiteUrl: typeof window !== 'undefined' ? window.location.origin : state.settings.general.websiteUrl,
    websiteDescription: state.settings.general.description,
    collegeEmail: state.settings.contact.email || 'kitspharmacollege@gmail.com',
    contactNumber: state.settings.contact.primaryPhone || '+91 97015 18708',
    timezone: 'Asia/Kolkata',
    defaultLanguage: 'English',
    defaultTheme: PRESET_THEMES[0].id,
    adminLoginPath: '/admin-login',
    adminPanelPath: '/control-panel',
  });

  const [adminSetup, setAdminSetup] = useState<AdminSetupInput>({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [adminError, setAdminError] = useState('');
  const [installing, setInstalling] = useState(false);
  const [installError, setInstallError] = useState('');

  const strength = evaluatePasswordStrength(adminSetup.password);

  useEffect(() => {
    let active = true;
    void installService.getStatus().then((res) => {
      if (!active) return;
      if (res.ok && res.data?.installed) {
        setAlreadyInstalled(true);
      }
      setCheckingStatus(false);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (alreadyInstalled || currentStep !== 2) return;
    setLoadingReqs(true);
    void installService.getRequirements().then((res) => {
      setLoadingReqs(false);
      if (res.ok && res.data) {
        setRequirements(res.data.checks);
        setAllReqsPassed(res.data.allPassed);
      }
    });
  }, [alreadyInstalled, currentStep]);

  const handleTestDb = async () => {
    if (!dbConfig.host.trim() || !dbConfig.database.trim() || !dbConfig.username.trim()) {
      setDbTestResult({
        success: false,
        message: 'Enter database host, database name, and database username before testing.',
      });
      return;
    }
    setDbTesting(true);
    setDbTestResult(null);
    const res = await installService.testDatabase(dbConfig);
    setDbTesting(false);
    if (!res.ok) {
      setDbTestResult({ success: false, message: res.message || 'Database connection failed.' });
      return;
    }
    setDbTestResult({
      success: true,
      message: res.message || `Connected to ${res.data?.database} (${res.data?.serverVersion}).`,
    });
  };

  const handleSaveSiteConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSiteConfig((prev) => ({
      ...prev,
      adminLoginPath: sanitizePathInput(prev.adminLoginPath, '/admin-login'),
      adminPanelPath: sanitizePathInput(prev.adminPanelPath, '/control-panel'),
    }));
    navigate('/install/admin');
  };

  const handleAdminContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminSetup.name.trim() || !adminSetup.email.trim() || !adminSetup.username.trim()) {
      setAdminError('Please complete full name, email address, and username.');
      return;
    }
    if (!/^[a-zA-Z0-9_-]{3,60}$/.test(adminSetup.username.trim())) {
      setAdminError('Username must be 3-60 characters (letters, numbers, hyphens, underscores).');
      return;
    }
    if (adminSetup.password.length < 8) {
      setAdminError('Password must be at least 8 characters long.');
      return;
    }
    if (adminSetup.password !== adminSetup.confirmPassword) {
      setAdminError('Password and confirmation do not match.');
      return;
    }
    setAdminError('');
    navigate('/install/summary');
  };

  const handleFinishInstall = async () => {
    setInstalling(true);
    setInstallError('');

    const sanitizedLoginPath = sanitizePathInput(siteConfig.adminLoginPath, '/admin-login');
    const sanitizedPanelPath = sanitizePathInput(siteConfig.adminPanelPath, '/control-panel');

    const res = await installService.executeInstallation({
      database: dbConfig,
      website: {
        ...siteConfig,
        adminLoginPath: sanitizedLoginPath,
        adminPanelPath: sanitizedPanelPath,
      },
      admin: adminSetup,
    });

    setInstalling(false);

    if (!res.ok || !res.data) {
      setInstallError(res.message || 'Installation failed. Please verify database and administrator fields.');
      return;
    }

    setCompletedPaths({
      login: res.data.adminLoginPath || sanitizedLoginPath,
      panel: res.data.adminPanelPath || sanitizedPanelPath,
    });

    await refreshBootstrap();
    navigate('/install/complete');
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-[#FCFAFF] flex items-center justify-center p-6">
        <SeoHead noIndex pageTitle="Checking Installation State | KITS CMS" />
        <div className="flex items-center gap-2 text-sm text-[#52128B] font-medium">
          <Loader2 className="w-4 h-4 animate-spin" /> Checking installation lock status...
        </div>
      </div>
    );
  }

  if (alreadyInstalled && currentStep !== 7) {
    return (
      <div className="min-h-screen bg-[#FCFAFF] flex items-center justify-center p-4">
        <SeoHead noIndex pageTitle="Installation Locked | KITS CMS" />
        <div className="max-w-lg w-full bg-white border border-[#E8DFF5] rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-[#171238]">Installation Already Completed & Locked</h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            This KITS College of Pharmacy for Women CMS instance is already installed and locked. Creating
            additional Super Administrators or re-running the installer from the web interface is disabled
            for security.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-[#52128B] hover:bg-[#32105B] rounded-full"
            >
              Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAFF] py-8 px-4">
      <SeoHead noIndex pageTitle="KITS CMS Installation Wizard" />
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E8DFF5] rounded-2xl p-5">
          <KitsLogo
            logoUrl={state.header.logoUrl}
            title="KITS Website Installer"
            subtitle="Self-Hosted cPanel & MySQL Setup"
          />
          <Link to="/" className="text-xs font-semibold text-[#52128B] hover:underline">
            Public Website →
          </Link>
        </div>

        {/* Stepper */}
        <div className="bg-white border border-[#E8DFF5] rounded-2xl p-4 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[600px] gap-2">
            {STEPS.map((step) => {
              const active = step.id === currentStep;
              const done = step.id < currentStep;
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-[#52128B] text-white'
                      : done
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-500'
                  }`}
                >
                  <span className="tabular-nums">{step.id}.</span>
                  <span>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Card */}
        <div className="bg-white border border-[#E8DFF5] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* STEP 1: WELCOME */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#B21A83]">
                  Step 1 of 7 · Introduction
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#171238]">
                  Welcome to KITS CMS First-Time Installation
                </h1>
                <p className="text-sm text-[#3A3356] leading-relaxed">
                  This guided installer connects your KITS College of Pharmacy for Women application to your
                  MySQL database, runs database migrations, seeds official institutional baselines, configures
                  your private administration routes, and creates your primary Super Administrator account.
                </p>
              </div>

              <div className="bg-[#F5F0FC] border border-[#E8DFF5] rounded-xl p-4 text-xs text-[#32105B] space-y-1">
                <div className="font-bold">Security & One-Time Lock Guarantee</div>
                <p>
                  Once installation finishes, a permanent server-side installation lock is written so this setup
                  wizard cannot be re-executed or used to create unauthorized administrator accounts.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/install/requirements')}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#52128B] hover:bg-[#32105B] rounded-full cursor-pointer"
                >
                  Start Installation <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: REQUIREMENTS */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#B21A83]">
                  Step 2 of 7 · Environment Verification
                </p>
                <h1 className="text-2xl font-bold text-[#171238]">Server Requirements Check</h1>
              </div>

              {loadingReqs ? (
                <div className="py-6 flex items-center gap-2 text-xs text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin text-[#52128B]" /> Inspecting server extensions & permissions...
                </div>
              ) : (
                <div className="divide-y divide-[#E8DFF5] border border-[#E8DFF5] rounded-xl">
                  {requirements.map((req) => (
                    <div key={req.key} className="p-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-bold text-[#171238] flex items-center gap-2">
                          <Server className="w-4 h-4 text-[#52128B]" />
                          {req.label}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{req.current}</div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold whitespace-nowrap ${
                          req.ok ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        {req.ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {req.ok ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/install')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-[#E8DFF5] rounded-full cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  type="button"
                  disabled={!allReqsPassed || loadingReqs}
                  onClick={() => navigate('/install/database')}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 text-sm font-semibold text-white bg-[#52128B] disabled:opacity-50 rounded-full cursor-pointer"
                >
                  Continue to Database <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DATABASE */}
          {currentStep === 3 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!dbConfig.host.trim() || !dbConfig.database.trim() || !dbConfig.username.trim()) {
                  setDbTestResult({
                    success: false,
                    message: 'Enter database host, database name, and database username before continuing.',
                  });
                  return;
                }
                navigate('/install/website');
              }}
              className="space-y-5"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#B21A83]">
                  Step 3 of 7 · Storage Configuration
                </p>
                <h1 className="text-2xl font-bold text-[#171238] flex items-center gap-2">
                  <Database className="w-6 h-6 text-[#52128B]" /> MySQL Database Configuration
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your cPanel MySQL database credentials. The server verifies connectivity directly before migrations run.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Database Engine</label>
                  <select
                    value={dbConfig.dbType}
                    onChange={(e) => setDbConfig({ ...dbConfig, dbType: e.target.value as DatabaseConfigInput['dbType'] })}
                    className="w-full px-3.5 py-2.5 border border-[#E8DFF5] rounded-lg bg-white"
                  >
                    <option value="MySQL">MySQL 8.0+</option>
                    <option value="MariaDB">MariaDB</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Database Host *</label>
                  <input
                    type="text"
                    required
                    value={dbConfig.host}
                    onChange={(e) => setDbConfig({ ...dbConfig, host: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E8DFF5] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Port *</label>
                  <input
                    type="text"
                    required
                    value={dbConfig.port}
                    onChange={(e) => setDbConfig({ ...dbConfig, port: e.target.value })}
                    className="w-full px-3.5 py-2.5 font-mono border border-[#E8DFF5] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Database Name *</label>
                  <input
                    type="text"
                    required
                    value={dbConfig.database}
                    onChange={(e) => setDbConfig({ ...dbConfig, database: e.target.value })}
                    className="w-full px-3.5 py-2.5 font-mono border border-[#E8DFF5] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Database Username *</label>
                  <input
                    type="text"
                    required
                    value={dbConfig.username}
                    onChange={(e) => setDbConfig({ ...dbConfig, username: e.target.value })}
                    placeholder="e.g. cpaneluser_kitsdb"
                    className="w-full px-3.5 py-2.5 border border-[#E8DFF5] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Database Password</label>
                  <input
                    type="password"
                    value={dbConfig.password}
                    onChange={(e) => setDbConfig({ ...dbConfig, password: e.target.value })}
                    placeholder="Database user password"
                    className="w-full px-3.5 py-2.5 border border-[#E8DFF5] rounded-lg"
                  />
                </div>
              </div>

              {dbTestResult && (
                <div
                  className={`p-3.5 rounded-xl text-xs border ${
                    dbTestResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}
                >
                  {dbTestResult.message}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/install/requirements')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-[#E8DFF5] rounded-full cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={dbTesting}
                    onClick={() => void handleTestDb()}
                    className="px-4 py-2.5 text-xs font-semibold text-[#52128B] bg-[#F5F0FC] rounded-full cursor-pointer"
                  >
                    {dbTesting ? 'Testing...' : 'Test Connection'}
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 text-sm font-semibold text-white bg-[#52128B] rounded-full cursor-pointer"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* STEP 4: WEBSITE CONFIG */}
          {currentStep === 4 && (
            <form onSubmit={handleSaveSiteConfig} className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#B21A83]">
                  Step 4 of 7 · Institutional Metadata & Private Admin Routes
                </p>
                <h1 className="text-2xl font-bold text-[#171238] flex items-center gap-2">
                  <Globe className="w-6 h-6 text-[#52128B]" /> Website & Route Configuration
                </h1>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Website Name *</label>
                  <input
                    type="text"
                    required
                    value={siteConfig.websiteName}
                    onChange={(e) => setSiteConfig({ ...siteConfig, websiteName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E8DFF5] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Website URL *</label>
                  <input
                    type="url"
                    required
                    value={siteConfig.websiteUrl}
                    onChange={(e) => setSiteConfig({ ...siteConfig, websiteUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E8DFF5] rounded-lg"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">Website Description</label>
                  <textarea
                    rows={2}
                    value={siteConfig.websiteDescription}
                    onChange={(e) => setSiteConfig({ ...siteConfig, websiteDescription: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E8DFF5] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">College Email *</label>
                  <input
                    type="email"
                    required
                    value={siteConfig.collegeEmail}
                    onChange={(e) => setSiteConfig({ ...siteConfig, collegeEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E8DFF5] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Contact Number *</label>
                  <input
                    type="text"
                    required
                    value={siteConfig.contactNumber}
                    onChange={(e) => setSiteConfig({ ...siteConfig, contactNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E8DFF5] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Timezone</label>
                  <input
                    type="text"
                    value={siteConfig.timezone}
                    onChange={(e) => setSiteConfig({ ...siteConfig, timezone: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E8DFF5] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Default Theme</label>
                  <select
                    value={siteConfig.defaultTheme}
                    onChange={(e) => setSiteConfig({ ...siteConfig, defaultTheme: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-[#E8DFF5] rounded-lg bg-white"
                  >
                    {PRESET_THEMES.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Configurable Admin Login Path</label>
                  <input
                    type="text"
                    value={siteConfig.adminLoginPath}
                    onChange={(e) => setSiteConfig({ ...siteConfig, adminLoginPath: e.target.value })}
                    placeholder="/admin-login"
                    className="w-full px-3.5 py-2.5 font-mono border border-[#E8DFF5] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Configurable Control Panel Path</label>
                  <input
                    type="text"
                    value={siteConfig.adminPanelPath}
                    onChange={(e) => setSiteConfig({ ...siteConfig, adminPanelPath: e.target.value })}
                    placeholder="/control-panel"
                    className="w-full px-3.5 py-2.5 font-mono border border-[#E8DFF5] rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/install/database')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-[#E8DFF5] rounded-full cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 text-sm font-semibold text-white bg-[#52128B] rounded-full cursor-pointer"
                >
                  Continue to Admin Setup <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 5: ADMIN SETUP */}
          {currentStep === 5 && (
            <form onSubmit={handleAdminContinue} className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#B21A83]">
                  Step 5 of 7 · Initial Super Administrator
                </p>
                <h1 className="text-2xl font-bold text-[#171238] flex items-center gap-2">
                  <UserPlus className="w-6 h-6 text-[#52128B]" /> Create Super Administrator
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  No default administrator credentials exist. Enter the credentials for your primary Super Administrator.
                </p>
              </div>

              {adminError && (
                <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                  {adminError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label htmlFor="install-admin-name" className="block font-semibold mb-1">Full Name *</label>
                  <input
                    id="install-admin-name"
                    type="text"
                    required
                    value={adminSetup.name}
                    onChange={(e) => setAdminSetup({ ...adminSetup, name: e.target.value })}
                    placeholder="Dr. / Principal / IT Admin Name"
                    className="w-full px-3.5 py-2.5 border border-[#E8DFF5] rounded-lg"
                  />
                </div>
                <div>
                  <label htmlFor="install-admin-email" className="block font-semibold mb-1">Email Address *</label>
                  <input
                    id="install-admin-email"
                    type="email"
                    required
                    value={adminSetup.email}
                    onChange={(e) => setAdminSetup({ ...adminSetup, email: e.target.value })}
                    placeholder="admin@college-domain.com"
                    className="w-full px-3.5 py-2.5 border border-[#E8DFF5] rounded-lg"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="install-admin-username" className="block font-semibold mb-1">Username *</label>
                  <input
                    id="install-admin-username"
                    type="text"
                    required
                    value={adminSetup.username}
                    onChange={(e) => setAdminSetup({ ...adminSetup, username: e.target.value })}
                    placeholder="Choose a unique administrator username"
                    className="w-full px-3.5 py-2.5 border border-[#E8DFF5] rounded-lg"
                  />
                </div>
                <div>
                  <label htmlFor="install-admin-password" className="block font-semibold mb-1">Password *</label>
                  <input
                    id="install-admin-password"
                    type="password"
                    required
                    value={adminSetup.password}
                    onChange={(e) => setAdminSetup({ ...adminSetup, password: e.target.value })}
                    placeholder="Minimum 8 characters"
                    className="w-full px-3.5 py-2.5 border border-[#E8DFF5] rounded-lg"
                  />
                </div>
                <div>
                  <label htmlFor="install-admin-confirm" className="block font-semibold mb-1">Confirm Password *</label>
                  <input
                    id="install-admin-confirm"
                    type="password"
                    required
                    value={adminSetup.confirmPassword}
                    onChange={(e) => setAdminSetup({ ...adminSetup, confirmPassword: e.target.value })}
                    placeholder="Re-enter password"
                    className="w-full px-3.5 py-2.5 border border-[#E8DFF5] rounded-lg"
                  />
                </div>
              </div>

              {/* Password Strength Indicator */}
              <div className="bg-[#FCFAFF] border border-[#E8DFF5] rounded-xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#52128B]" /> Password Strength
                  </span>
                  <span className="font-bold text-[#52128B]">{strength.label}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      className={`h-1.5 rounded-full ${
                        strength.score >= bar ? 'bg-[#52128B]' : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/install/website')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-[#E8DFF5] rounded-full cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 text-sm font-semibold text-white bg-[#52128B] rounded-full cursor-pointer"
                >
                  Review Summary <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 6: SUMMARY */}
          {currentStep === 6 && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#B21A83]">
                  Step 6 of 7 · Pre-Flight Review
                </p>
                <h1 className="text-2xl font-bold text-[#171238]">Installation Summary</h1>
              </div>

              {installError && (
                <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900">
                  {installError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-[#FCFAFF] border border-[#E8DFF5] space-y-1.5">
                  <div className="font-bold text-[#52128B]">Database Target</div>
                  <p>Engine: {dbConfig.dbType}</p>
                  <p>Host: {dbConfig.host}:{dbConfig.port}</p>
                  <p>Database: {dbConfig.database}</p>
                  <p>User: {dbConfig.username}</p>
                </div>
                <div className="p-4 rounded-xl bg-[#FCFAFF] border border-[#E8DFF5] space-y-1.5">
                  <div className="font-bold text-[#52128B]">Website & Administrator</div>
                  <p>Site: {siteConfig.websiteName}</p>
                  <p>Admin Login Path: {siteConfig.adminLoginPath}</p>
                  <p>Control Panel Path: {siteConfig.adminPanelPath}</p>
                  <p>Super Admin: {adminSetup.username} ({adminSetup.email})</p>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  disabled={installing}
                  onClick={() => navigate('/install/admin')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border border-[#E8DFF5] rounded-full cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Edit Admin Setup
                </button>
                <button
                  type="button"
                  disabled={installing}
                  onClick={() => void handleFinishInstall()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 rounded-full cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {installing ? 'Installing Database & Locking...' : 'Complete Installation'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: COMPLETE */}
          {currentStep === 7 && (
            <div className="text-center space-y-5 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold text-[#171238]">Installation Complete & Locked!</h1>
              <p className="text-sm text-[#3A3356] max-w-lg mx-auto">
                Your KITS College of Pharmacy for Women database schema, baseline institutional content,
                and Super Administrator account have been provisioned. The installer is now locked.
              </p>

              <div className="max-w-md mx-auto bg-[#FCFAFF] border border-[#E8DFF5] rounded-xl p-4 text-xs text-left space-y-1.5">
                <p><strong>Public Website:</strong> {siteConfig.websiteUrl}</p>
                <p><strong>Admin Sign-In Route:</strong> {completedPaths?.login || siteConfig.adminLoginPath}</p>
                <p><strong>Control Panel Route:</strong> {completedPaths?.panel || siteConfig.adminPanelPath}</p>
                <p><strong>Database:</strong> {dbConfig.dbType} ({dbConfig.database})</p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Link
                  to="/"
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-[#52128B] rounded-full"
                >
                  Visit Public Website
                </Link>
                <Link
                  to={completedPaths?.login || siteConfig.adminLoginPath}
                  className="px-6 py-2.5 text-sm font-semibold text-[#52128B] border border-[#52128B] rounded-full"
                >
                  Sign In to Control Panel
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
