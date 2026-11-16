# Frontend Source Code Audit — KITS College of Pharmacy for Women

**Audit Date:** 2026-11-16  
**Target Domain:** `https://kitspharmacy.ac.in/`  
**Hosting Target:** Conventional cPanel Shared Hosting (Apache + PHP 8.3+ / Laravel 12 + MySQL 8.0+)

---

## 1. Existing Technology Stack & Build Configuration

| Layer | Current Implementation | Audit Notes |
| --- | --- | --- |
| Build Tool | Vite `^8.3.0` (`@vitejs/plugin-react ^6.1.1`) | Static production bundle emitted to `dist/`. Custom plugin `copy-unbundled-src-assets` copies `src/assets/` into `dist/src/assets/` so static image URLs resolve in `dist/`. |
| Language | TypeScript `^7.0.2` (`tsc --noEmit`) | Strict typing across `src/types/cms.ts` and all React components. |
| UI & Styling | React `^19.0.1`, Tailwind CSS `^4.3.3`, `lucide-react`, `recharts`, `motion` | Preserved untouched for layout, colors (`#52128B`, `#32105B`, `#171238`, `#B21A83`, `#F2C34E`, `#F5F0FC`), typography (`Playfair Display`, `Plus Jakarta Sans`), and responsive breakpoints. |
| Routing | `react-router-dom ^7.18.5` | SPA routes for Public Website, Admin CMS, and 7-step Installer Wizard. |
| Validation | `zod ^4.6.7` (`src/utils/validation.ts`) | `enquirySchema`, `evaluatePasswordStrength`, `slugifyText`, CSV escaping helpers. |
| Existing Tests | `node:test` (`src/utils/logic.test.ts`) | 3 unit test suites covering `chatbotEngine`, `validation`, and `cmsStoreLogic`. |

---

## 2. Inventory of Existing Components, Routes & Modules

### 2.1 Public Website Routes (`src/App.tsx`, `src/pages/public/*`)
- `/` (`HomePage.tsx`): Hero slider, 6-card highlights strip, About KITS & Admissions banner, 6 Academic Departments, Why Choose KITS, Programs (B.Pharmacy / M.Pharmacy), Campus Life gallery strip, News & Events, Student Voices, Connect section + `EnquiryFormCard`.
- `/about`, `/about/history`, `/about/vision-mission`, `/about/principal-message`, `/about/governance` (`AboutPage.tsx`)
- `/academics`, `/academics/programs`, `/academics/calendar`, `/academics/syllabus`, `/academics/examination-cell` (`AcademicsPage.tsx`)
- `/admissions`, `/admissions/eligibility`, `/admissions/process` (`AdmissionsPage.tsx`)
- `/departments`, `/departments/:slug` (`DepartmentsPage.tsx`)
- `/faculty`, `/campus-life`, `/campus-life/:slug` (`FacultyCampusPages.tsx`)
- `/achievements`, `/placements`, `/news`, `/news/:slug`, `/events`, `/events/:slug`, `/gallery`, `/gallery/:slug` (`ShowcasePages.tsx`)
- `/downloads`, `/contact`, `/feedback`, `/privacy-policy`, `/terms`, `/sitemap`, `/p/:slug`, `*` (`ContactUtilityPages.tsx`)

### 2.2 Public Layout & Widgets
- `src/components/layout/PublicLayout.tsx`: Top info bar, sticky header, single-line dropdown nav bar, global search modal, multi-column footer, mobile bottom bar, maintenance screen.
- `src/components/chatbot/KitsChatbot.tsx` + `src/utils/chatbotEngine.ts`: Floating `KITS AI Assistant` widget using local keyword scoring against FAQ array.
- `src/components/common/EnquiryFormCard.tsx`: Admission enquiry form validated by `enquirySchema`.

### 2.3 Existing Admin Console (`src/admin/*`)
- `AdminLogin.tsx`, `AdminLayout.tsx`, `AdminDashboard.tsx`
- `AppearanceThemeManager.tsx` (Appearance, Themes, Branding tabs + live Desktop/Tablet/Mobile preview)
- `HeaderNavFooterManager.tsx` (`HeaderManager`, `NavigationManager`, `FooterManager`)
- `PageBuilderManager.tsx` (`PagesListManager`, `PageBuilderDetail` with 16 section block types)
- `SlidersBannersMediaManager.tsx` (`SlidersManager`, `BannersManager`, `MediaLibraryManager`)
- `AcademicsEnquiriesManager.tsx` (`ProgramsManager`, `DepartmentsManager`, `FacultyManager`, `AdmissionsManager`, `EnquiriesManager` with CSV export)
- `ContentModulesManager.tsx` (`NewsEventsManager`, `AchievementsManager`, `PlacementsManager`, `CampusLifeManager`, `GalleryManager`, `TestimonialsManager`, `DownloadsManager`)
- `ChatbotManager.tsx` (`ChatbotSettingsManager`, `ChatbotFaqManager`)
- `SystemAdminManagers.tsx` (`SeoManager`, `ContactSocialManager`, `FormsManager`, `UsersRolesManager`, `NotificationsManager`, `WebsiteSettingsManager`, `InstallInfoManager`, `ActivityLogsManager`)

### 2.4 Existing Installation Wizard (`src/pages/install/InstallWizardPage.tsx`)
- 7 routes: `/install`, `/install/requirements`, `/install/database`, `/install/website`, `/install/admin`, `/install/summary`, `/install/complete`.

---

## 3. Critical Production Gaps & Security Findings Identified

1. **Exposed Admin & Installer Links on Public Pages (SECURITY / PRIVACY GAP)**:
   - `PublicLayout.tsx` renders `CMS Admin` (`/admin`) in desktop navigation (line 305), mobile drawer (line 354), and maintenance screen (line 70), plus `Installer Preview` (`/install`) in the footer (line 557).
   - `kitsSeedData.ts` seeds `staffPortalLabel: 'Staff Portal'` pointing to `/admin/login` (line 158) and footer link `'Admin CMS'` pointing to `/admin` (line 299).
   - **Action**: Remove all admin, CMS, and installer links from public navigation, top bar, footer, maintenance screen, and public sitemap. Use configurable admin paths (`/admin-login` and `/control-panel/*` by default).

2. **Demo Authentication & Hardcoded Credentials (CRITICAL SECURITY GAP)**:
   - `src/admin/AdminLogin.tsx` pre-fills `kits_admin` and `demo-preview-only` with a `DEMO MODE AUTHENTICATION ADAPTER` banner and bypasses real authentication via `signInDemo()`.
   - `src/services/auth/authService.ts` writes fake sessions to `sessionStorage` (`kits_demo_admin_session_v1`).
   - `src/data/defaults/kitsSeedData.ts` seeds 3 demo admin user records (`usr-1`, `usr-2`, `usr-3`).
   - **Action**: Remove all demo credentials, sample admin users, demo login buttons, and `DEMO MODE` strips. Implement real server-side Laravel Sanctum / HTTP-only session cookie authentication with CSRF protection, throttling, forgot/reset password, profile updates, and password changes. Create the first Super Administrator exclusively during `/install/`.

3. **Browser `localStorage` State Instead of Real MySQL Persistence**:
   - `src/services/cms/cmsService.ts` persists `CmsState` to `localStorage` (`kits_pharmacy_cms_demo_v1`).
   - `src/services/api/apiClient.ts` returns `Running in Frontend Demo Mode` whenever `VITE_API_BASE_URL` is unset.
   - `src/admin/AdminDashboard.tsx` displays hardcoded `ENQUIRIES_TREND_SAMPLE` instead of live database metrics.
   - **Action**: Connect the React app directly to `/api/v1/*` with CSRF & cookie credentials, typed API services, proper loading and error boundaries (never silently falling back to fake data in production), real dashboard database aggregations, and server-side media uploads (`multipart/form-data`).

4. **Simulated Installer Wizard**:
   - `src/services/installation/installService.ts` uses `runSimulatedRequirementChecks()` and `simulateDatabaseConnectionTest()`, and `/install` remains unlocked after installation.
   - **Action**: Wire `/install/` to real backend endpoints checking PHP 8.3+, extensions, writable directories, real PDO MySQL connection testing (without exposing DB passwords), running migrations, writing `.env` & installation lock, creating the initial Super Administrator securely, and rejecting all `/install/*` requests once installed.

5. **Client-Only Media & Chatbot Handling**:
   - `SlidersBannersMediaManager.tsx` and `AppearanceThemeManager.tsx` convert local files to Base64 Data URLs in browser memory.
   - `KitsChatbot.tsx` runs purely in-browser without server logging, rate limiting, or optional Gemini AI grounding.
   - **Action**: Implement multipart file upload (`POST /api/v1/media`) storing assets on server disk (`storage/app/public/uploads/...`) and serving public URLs; implement `POST /api/v1/chatbot/message` combining MySQL FAQ knowledge base matching, approved site content grounding, optional server-side Gemini API call (only when `GEMINI_API_KEY` is configured on server), rate limiting, and conversation logging.

6. **SEO Infrastructure**:
   - Public pages lack per-route dynamic `<title>`, `<meta name="description">`, canonical URLs, JSON-LD `CollegeOrUniversity` / `BreadcrumbList` injection, dynamic `/sitemap.xml` (excluding admin/install), and `robots.txt` blocking `/admin-login`, `/control-panel`, and `/install`.
   - **Action**: Add `SeoHead` component + Laravel `SitemapController` & `RobotsController` + `NoIndexAdminHeaders` middleware (`X-Robots-Tag: noindex, nofollow`).
