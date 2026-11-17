import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CmsProvider, useCms } from './app/providers/CmsContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PublicLayout } from './components/layout/PublicLayout';
import { HomePage } from './pages/public/HomePage';
import { AboutPage } from './pages/public/AboutPage';
import { AcademicsPage } from './pages/public/AcademicsPage';
import { AdmissionsPage } from './pages/public/AdmissionsPage';
import { DepartmentDetailPage, DepartmentsPage } from './pages/public/DepartmentsPage';
import { CampusLifePage, FacultyPage } from './pages/public/FacultyCampusPages';
import {
  AchievementsPage,
  GalleryPage,
  NewsEventsPage,
  PlacementsPage,
} from './pages/public/ShowcasePages';
import {
  ContactPage,
  DownloadsPage,
  DynamicCmsPage,
  FeedbackPage,
  NotFoundPage,
  PrivacyPolicyPage,
  SitemapPage,
  TermsPage,
} from './pages/public/ContactUtilityPages';
import { AdminLogin } from './admin/AdminLogin';
import { AdminLayout } from './admin/AdminLayout';
import { AdminDashboard } from './admin/AdminDashboard';
import { AppearanceThemeManager } from './admin/AppearanceThemeManager';
import { FooterManager, HeaderManager, NavigationManager } from './admin/HeaderNavFooterManager';
import { PageBuilderDetail, PagesListManager } from './admin/PageBuilderManager';
import {
  BannersManager,
  MediaLibraryManager,
  SlidersManager,
} from './admin/SlidersBannersMediaManager';
import {
  AdmissionsManager,
  DepartmentsManager,
  EnquiriesManager,
  FacultyManager,
  ProgramsManager,
} from './admin/AcademicsEnquiriesManager';
import {
  AchievementsManager,
  CampusLifeManager,
  DownloadsManager,
  GalleryManager,
  NewsEventsManager,
  PlacementsManager,
  TestimonialsManager,
} from './admin/ContentModulesManager';
import { ChatbotFaqManager, ChatbotSettingsManager } from './admin/ChatbotManager';
import {
  ActivityLogsManager,
  ContactSocialManager,
  FormsManager,
  InstallInfoManager,
  NotificationsManager,
  SeoManager,
  UsersRolesManager,
  WebsiteSettingsManager,
} from './admin/SystemAdminManagers';
import { InstallWizardPage } from './pages/install/InstallWizardPage';

const AppRoutes: React.FC = () => {
  const { adminLoginPath, adminPanelPath } = useCms();

  return (
    <Routes>
      {/* Public Institutional Website Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/about/history" element={<AboutPage />} />
        <Route path="/about/vision-mission" element={<AboutPage />} />
        <Route path="/about/principal-message" element={<AboutPage />} />
        <Route path="/about/governance" element={<AboutPage />} />

        <Route path="/academics" element={<AcademicsPage />} />
        <Route path="/academics/programs" element={<AcademicsPage />} />
        <Route path="/academics/calendar" element={<AcademicsPage />} />
        <Route path="/academics/syllabus" element={<AcademicsPage />} />
        <Route path="/academics/examination-cell" element={<AcademicsPage />} />

        <Route path="/admissions" element={<AdmissionsPage />} />
        <Route path="/admissions/eligibility" element={<AdmissionsPage />} />
        <Route path="/admissions/process" element={<AdmissionsPage />} />

        <Route path="/departments" element={<DepartmentsPage />} />
        <Route path="/departments/:slug" element={<DepartmentDetailPage />} />

        <Route path="/faculty" element={<FacultyPage />} />
        <Route path="/campus-life" element={<CampusLifePage />} />
        <Route path="/campus-life/:slug" element={<CampusLifePage />} />

        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/placements" element={<PlacementsPage />} />

        <Route path="/news" element={<NewsEventsPage />} />
        <Route path="/news/:slug" element={<NewsEventsPage />} />
        <Route path="/events" element={<NewsEventsPage />} />
        <Route path="/events/:slug" element={<NewsEventsPage />} />

        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/gallery/:slug" element={<GalleryPage />} />

        <Route path="/downloads" element={<DownloadsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/sitemap" element={<SitemapPage />} />
        <Route path="/p/:slug" element={<DynamicCmsPage />} />
      </Route>

      {/* Protected Configurable Admin Auth & Control Panel Routes */}
      <Route path={adminLoginPath} element={<AdminLogin />} />
      <Route path="/forgot-password" element={<AdminLogin />} />
      <Route path="/reset-password" element={<AdminLogin />} />

      <Route path={adminPanelPath} element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="appearance" element={<AppearanceThemeManager initialTab="appearance" />} />
        <Route path="themes" element={<AppearanceThemeManager initialTab="themes" />} />
        <Route path="branding" element={<AppearanceThemeManager initialTab="branding" />} />
        <Route path="header" element={<HeaderManager />} />
        <Route path="navigation" element={<NavigationManager />} />
        <Route path="footer" element={<FooterManager />} />
        <Route path="pages" element={<PagesListManager />} />
        <Route path="pages/:id" element={<PageBuilderDetail />} />
        <Route path="sliders" element={<SlidersManager />} />
        <Route path="banners" element={<BannersManager />} />
        <Route path="media" element={<MediaLibraryManager />} />
        <Route path="programs" element={<ProgramsManager />} />
        <Route path="departments" element={<DepartmentsManager />} />
        <Route path="faculty" element={<FacultyManager />} />
        <Route path="admissions" element={<AdmissionsManager />} />
        <Route path="enquiries" element={<EnquiriesManager />} />
        <Route path="news" element={<NewsEventsManager />} />
        <Route path="events" element={<NewsEventsManager />} />
        <Route path="achievements" element={<AchievementsManager />} />
        <Route path="placements" element={<PlacementsManager />} />
        <Route path="campus-life" element={<CampusLifeManager />} />
        <Route path="gallery" element={<GalleryManager />} />
        <Route path="testimonials" element={<TestimonialsManager />} />
        <Route path="downloads" element={<DownloadsManager />} />
        <Route path="chatbot" element={<ChatbotSettingsManager />} />
        <Route path="chatbot/faqs" element={<ChatbotFaqManager />} />
        <Route path="seo" element={<SeoManager />} />
        <Route path="contact-social" element={<ContactSocialManager />} />
        <Route path="forms" element={<FormsManager />} />
        <Route path="users" element={<UsersRolesManager />} />
        <Route path="roles" element={<UsersRolesManager />} />
        <Route path="notifications" element={<NotificationsManager />} />
        <Route path="settings" element={<WebsiteSettingsManager />} />
        <Route path="install-info" element={<InstallInfoManager />} />
        <Route path="activity-logs" element={<ActivityLogsManager />} />
      </Route>

      {/* First-Time Installation Wizard Routes */}
      <Route path="/install" element={<InstallWizardPage />} />
      <Route path="/install/requirements" element={<InstallWizardPage />} />
      <Route path="/install/database" element={<InstallWizardPage />} />
      <Route path="/install/website" element={<InstallWizardPage />} />
      <Route path="/install/admin" element={<InstallWizardPage />} />
      <Route path="/install/summary" element={<InstallWizardPage />} />
      <Route path="/install/complete" element={<InstallWizardPage />} />

      {/* 404 Fallback */}
      <Route element={<PublicLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <CmsProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CmsProvider>
    </ErrorBoundary>
  );
}
