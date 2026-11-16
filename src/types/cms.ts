export type VerificationStatus = 'verified' | 'pending_verification' | 'sample_demo';

export interface ThemePalette {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  goldColor: string;
  backgroundColor: string;
  surfaceColor: string;
  cardBackground: string;
  headingColor: string;
  bodyTextColor: string;
  linkColor: string;
  buttonBg: string;
  buttonHover: string;
  headerBg: string;
  navBg: string;
  footerBg: string;
  borderColor: string;
}

export interface TypographyConfig {
  headingFont: 'Playfair Display' | 'Cormorant Garamond' | 'Lora' | 'Plus Jakarta Sans';
  bodyFont: 'Plus Jakarta Sans' | 'DM Sans' | 'Inter' | 'Lora';
  baseFontSize: number;
  headingWeight: number;
  lineHeight: number;
  headingTracking: string;
}

export interface LayoutConfig {
  contentWidth: '1140px' | '1280px' | '1400px';
  headerHeight: number;
  footerStyle: 'multi-column' | 'compact';
  sectionSpacing: number;
  cardRadius: number;
  buttonRadius: number;
  shadowIntensity: 'subtle' | 'medium' | 'elevated';
  stickyHeader: boolean;
}

export interface AppearanceConfig {
  activeThemeId: string;
  palette: ThemePalette;
  customThemes: ThemePalette[];
  typography: TypographyConfig;
  layout: LayoutConfig;
}

export interface NavItem {
  id: string;
  label: string;
  path: string;
  order: number;
  enabled: boolean;
  openInNewTab?: boolean;
  children?: NavItem[];
}

export interface HeaderConfig {
  collegeName: string;
  collegeSubtitle: string;
  locationShort: string;
  affiliationText: string;
  approvalText: string;
  phone: string;
  secondaryPhone: string;
  email: string;
  workingHours: string;
  announcementText: string;
  announcementLink: string;
  showAnnouncement: boolean;
  examPortalLabel: string;
  examPortalUrl: string;
  studentPortalLabel: string;
  studentPortalUrl: string;
  staffPortalLabel: string;
  staffPortalUrl: string;
  defaultLanguage: string;
  applyButtonLabel: string;
  applyButtonPath: string;
  logoUrl: string;
  headerBg: string;
  headerTextColor: string;
  navBg: string;
  navTextColor: string;
  sticky: boolean;
}

export interface FooterLink {
  id: string;
  label: string;
  path: string;
  openInNewTab?: boolean;
}

export interface FooterColumn {
  id: string;
  title: string;
  links: FooterLink[];
}

export interface FooterConfig {
  logoUrl: string;
  introText: string;
  columns: FooterColumn[];
  address: string;
  phone: string;
  email: string;
  copyrightText: string;
  backgroundColor: string;
  textColor: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    youtube: string;
    linkedin: string;
    x: string;
  };
  customBlockTitle: string;
  customBlockContent: string;
}

export interface HeroSlide {
  id: string;
  badge: string;
  heading: string;
  highlightedText: string;
  subheading: string;
  description: string;
  desktopImage: string;
  mobileImage: string;
  imageAlt: string;
  primaryCtaLabel: string;
  primaryCtaLink: string;
  secondaryCtaLabel: string;
  secondaryCtaLink: string;
  overlayOpacity: number;
  textPosition: 'left' | 'center';
  animation: 'fade' | 'slide';
  durationMs: number;
  order: number;
  active: boolean;
  startDate?: string;
  endDate?: string;
  videoUrl?: string;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
  imageUrl: string;
  active: boolean;
  placement: 'homepage' | 'admissions' | 'academics';
}

export type SectionType =
  | 'hero'
  | 'image_text'
  | 'text'
  | 'stats'
  | 'card_grid'
  | 'programs'
  | 'departments'
  | 'gallery'
  | 'testimonials'
  | 'news'
  | 'events'
  | 'cta_banner'
  | 'contact'
  | 'faq'
  | 'video'
  | 'custom';

export interface PageSection {
  id: string;
  type: SectionType;
  title: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string;
  imageAlt?: string;
  background?: 'default' | 'lavender' | 'purple' | 'white';
  paddingY?: 'sm' | 'md' | 'lg';
  hidden: boolean;
  order: number;
  ctaLabel?: string;
  ctaLink?: string;
  items?: { title: string; description: string; meta?: string }[];
}

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft' | 'scheduled';
  scheduledAt?: string;
  enabled: boolean;
  seoTitle: string;
  seoDescription: string;
  sections: PageSection[];
  updatedAt: string;
  isSystemRoute?: boolean;
}

export interface MediaItem {
  id: string;
  title: string;
  altText: string;
  type: 'image' | 'video' | 'pdf' | 'brochure';
  folder: 'Campus' | 'Laboratories' | 'Logos' | 'Faculty' | 'Events' | 'Documents' | 'Banners';
  url: string;
  fileSize: string;
  dimensions?: string;
  uploadedAt: string;
  isLocalPreview?: boolean;
}

export interface AcademicProgram {
  id: string;
  name: string;
  code: string;
  level: 'UG' | 'PG' | 'Diploma';
  qualification: string;
  duration: string;
  eligibility: string;
  description: string;
  intakeCapacity: string;
  admissionInfo: string;
  brochureUrl: string;
  verificationStatus: VerificationStatus;
  active: boolean;
}

export interface Department {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  introduction: string;
  iconName: string;
  imageUrl: string;
  imageAlt: string;
  facilities: string[];
  laboratories: string[];
  researchAreas: string[];
  publications: string[];
  active: boolean;
  verificationStatus: VerificationStatus;
}

export interface FacultyMember {
  id: string;
  name: string;
  photoUrl: string;
  photoAlt: string;
  designation: string;
  departmentId: string;
  departmentName: string;
  qualification: string;
  experience: string;
  biography: string;
  email: string;
  researchInterests: string[];
  publicationsCount: number;
  order: number;
  active: boolean;
  verificationStatus: VerificationStatus;
}

export type EnquiryStatus =
  | 'New'
  | 'Contacted'
  | 'Interested'
  | 'Follow-up'
  | 'Converted'
  | 'Not Interested';

export interface AdmissionEnquiry {
  id: string;
  studentName: string;
  parentName: string;
  mobile: string;
  email: string;
  interestedProgram: string;
  qualification: string;
  city: string;
  state: string;
  message: string;
  status: EnquiryStatus;
  assignedTo: string;
  notes: string;
  followUpDate: string;
  createdAt: string;
}

export interface NewsEventItem {
  id: string;
  type: 'news' | 'event' | 'announcement';
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  imageAlt: string;
  category: string;
  eventDate: string;
  venue: string;
  author: string;
  publishedAt: string;
  status: 'published' | 'draft' | 'scheduled';
  seoTitle: string;
  seoDescription: string;
}

export interface AchievementItem {
  id: string;
  category: 'Student' | 'Faculty' | 'Institutional' | 'Research';
  title: string;
  recipient: string;
  year: string;
  description: string;
  imageUrl: string;
  verificationStatus: VerificationStatus;
  active: boolean;
}

export interface PlacementRecord {
  id: string;
  companyName: string;
  sector: string;
  roleTitle: string;
  year: string;
  notes: string;
  verificationStatus: VerificationStatus;
  active: boolean;
}

export interface CampusLifeItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  details: string;
  highlights: string[];
  imageUrl: string;
  imageAlt: string;
  active: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Campus' | 'Laboratories' | 'Cultural' | 'Sports' | 'Seminars' | 'Workshops' | 'Events';
  mediaType: 'photo' | 'video';
  url: string;
  youtubeId?: string;
  altText: string;
  date: string;
  active: boolean;
}

export interface TestimonialItem {
  id: string;
  studentName: string;
  photoUrl: string;
  course: string;
  graduationYear: string;
  quote: string;
  active: boolean;
  verificationStatus: VerificationStatus;
}

export interface DownloadDocument {
  id: string;
  title: string;
  category: 'Syllabus' | 'Academic Calendar' | 'Admissions' | 'Examinations' | 'Brochure';
  fileUrl: string;
  fileSize: string;
  updatedAt: string;
  active: boolean;
}

export type ChatbotCategory =
  | 'College Information'
  | 'Admissions'
  | 'Courses'
  | 'Eligibility'
  | 'Departments'
  | 'Faculty'
  | 'Facilities'
  | 'Hostel'
  | 'Contact'
  | 'Academic Information';

export interface ChatbotFAQ {
  id: string;
  category: ChatbotCategory;
  question: string;
  answer: string;
  keywords: string[];
  enabled: boolean;
}

export interface ChatbotConversationLog {
  id: string;
  userQuery: string;
  matchedFaqId?: string;
  botResponse: string;
  timestamp: string;
  matched: boolean;
}

export interface ChatbotConfig {
  enabled: boolean;
  name: string;
  avatarUrl: string;
  welcomeMessage: string;
  primaryColor: string;
  suggestedQuestions: string[];
  fallbackMessage: string;
  providerMode: 'local_faq' | 'backend_ai_adapter';
  faqs: ChatbotFAQ[];
  conversations: ChatbotConversationLog[];
}

export interface SeoConfig {
  siteTitle: string;
  siteDescription: string;
  defaultKeywords: string;
  faviconUrl: string;
  defaultOgImage: string;
  robotsIndex: boolean;
  enableSitemap: boolean;
  enableBreadcrumbs: boolean;
  enableStructuredData: boolean;
  institutionType: string;
}

export interface FormDefinition {
  id: string;
  name: string;
  slug: string;
  description: string;
  recipientEmail: string;
  submitLabel: string;
  successMessage: string;
  fields: { id: string; label: string; type: string; required: boolean }[];
  active: boolean;
}

export type AdminRoleName =
  | 'Super Administrator'
  | 'Website Administrator'
  | 'Content Editor'
  | 'Admissions Manager'
  | 'Academic Manager'
  | 'Faculty Manager';

export type PermissionKey =
  | 'website_management'
  | 'appearance_management'
  | 'page_management'
  | 'admissions'
  | 'news'
  | 'academic_content'
  | 'chatbot'
  | 'user_management'
  | 'system_settings';

export interface RoleDefinition {
  id: string;
  name: AdminRoleName;
  description: string;
  permissions: PermissionKey[];
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: AdminRoleName;
  active: boolean;
  lastLogin: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'enquiry' | 'system' | 'content';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface WebsiteSettings {
  general: {
    websiteName: string;
    websiteUrl: string;
    collegeName: string;
    description: string;
    timezone: string;
    language: string;
    contactEmail: string;
    contactPhone: string;
  };
  branding: {
    mainLogo: string;
    footerLogo: string;
    mobileLogo: string;
    favicon: string;
    loginLogo: string;
  };
  contact: {
    address: string;
    primaryPhone: string;
    landlinePhone: string;
    email: string;
    workingHours: string;
    whatsappNumber: string;
    mapQuery: string;
    mapEmbedUrl: string;
  };
  social: {
    facebook: string;
    instagram: string;
    youtube: string;
    linkedin: string;
    x: string;
  };
  integrations: {
    googleAnalyticsId: string;
    searchConsoleVerification: string;
    googleMapsConfigured: boolean;
    whatsappEnabled: boolean;
    smtpHost: string;
    smtpPort: string;
    aiProviderEndpoint: string;
  };
  maintenance: {
    enabled: boolean;
    mode: 'maintenance' | 'coming_soon';
    message: string;
  };
  admissionsConfig: {
    academicYear: string;
    admissionsOpen: boolean;
    headline: string;
    subtext: string;
    importantDates: { label: string; date: string }[];
    scholarshipNote: string;
    feeNote: string;
    processSteps: { step: string; title: string; detail: string }[];
  };
}

export interface ActivityLog {
  id: string;
  actor: string;
  role: string;
  action: string;
  module: string;
  timestamp: string;
}

export interface InstallStatusInfo {
  isInstalledDemo: boolean;
  installedAt?: string;
  databaseType: string;
  databaseHost: string;
  databaseName: string;
  appVersion: string;
  environmentMode: 'frontend_demo' | 'backend_ready';
}

export interface RuntimeAdminConfig {
  adminLoginPath: string;
  adminPanelPath: string;
}

export interface DashboardMetrics {
  kpis: {
    totalEnquiries: number;
    newEnquiries: number;
    convertedEnquiries: number;
    publishedPages: number;
    totalPages: number;
    mediaCount: number;
    newsCount: number;
    faqCount: number;
    chatbotTotalQueries: number;
    unreadNotifications: number;
  };
  monthlyTrend: { month: string; enquiries: number }[];
  programBreakdown: { program: string; count: number }[];
}

export interface CmsState {
  installed?: boolean;
  runtimeConfig?: RuntimeAdminConfig;
  appearance: AppearanceConfig;
  header: HeaderConfig;
  navigation: NavItem[];
  footer: FooterConfig;
  sliders: HeroSlide[];
  banners: PromoBanner[];
  pages: CmsPage[];
  media: MediaItem[];
  programs: AcademicProgram[];
  departments: Department[];
  faculty: FacultyMember[];
  enquiries: AdmissionEnquiry[];
  newsEvents: NewsEventItem[];
  achievements: AchievementItem[];
  placements: PlacementRecord[];
  campusLife: CampusLifeItem[];
  gallery: GalleryItem[];
  testimonials: TestimonialItem[];
  downloads: DownloadDocument[];
  chatbot: ChatbotConfig;
  seo: SeoConfig;
  forms: FormDefinition[];
  users: AdminUser[];
  roles: RoleDefinition[];
  notifications: NotificationItem[];
  settings: WebsiteSettings;
  activityLogs: ActivityLog[];
  installInfo: InstallStatusInfo;
}
