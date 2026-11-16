# API Endpoint Mapping — KITS Pharmacy CMS (`/api/v1`)

All endpoints return a consistent JSON envelope:
- **Success:** `{ "success": true, "message": "...", "data": ..., "meta": { ... } }`
- **Error:** `{ "success": false, "message": "...", "errors": { "field": ["..."] } }`

Authentication uses **HTTP-only Same-Site session cookies** + **CSRF protection** (`/sanctum/csrf-cookie` or `GET /api/v1/auth/csrf`).

---

## 1. Public Website Endpoints (No Auth Required)

| Frontend Action / View | HTTP Method & Endpoint | Controller Method | Notes |
| --- | --- | --- | --- |
| Initial app load (`CmsContext`) | `GET /api/v1/public/bootstrap` | `PublicSiteController@bootstrap` | Returns published pages, active appearance/theme, header, nav menus, footer, active sliders, banners, programs, departments, faculty, campus life, news/events, gallery, achievements, placements, testimonials, downloads, chatbot public config, SEO, install lock status & public runtime admin path ONLY when authenticated or configured safely (never exposes credentials or admin menu items). |
| Public dynamic page `/p/:slug` | `GET /api/v1/public/pages/{slug}` | `PublicSiteController@page` | Returns only `status = 'published'` (or scheduled past `published_at`); draft pages return `404`. |
| Department detail `/departments/:slug` | `GET /api/v1/public/departments/{slug}` | `PublicSiteController@department` | Returns active department + assigned active faculty. |
| News / Events listing & detail | `GET /api/v1/public/news-events`, `GET /api/v1/public/news-events/{slug}` | `PublicSiteController@news` | Supports `?type=`, `?category=`, `?search=`, pagination. |
| Submit Admission Enquiry (`EnquiryFormCard`) | `POST /api/v1/public/enquiries` | `PublicEnquiryController@store` | Rate-limited (`throttle:10,1`), Zod/Laravel validated, stores in `admission_enquiries`, creates admin notification. |
| Submit Feedback (`FeedbackPage`) | `POST /api/v1/public/feedback` | `PublicEnquiryController@storeFeedback` | Validated and persisted cleanly. |
| Chatbot query (`KitsChatbot`) | `POST /api/v1/chatbot/message` | `ChatbotPublicController@respond` | Rate-limited (`throttle:30,1`), scores MySQL `chatbot_faqs`, optionally invokes server-side Gemini API if `GEMINI_API_KEY` set, logs to `chatbot_conversations` + `chatbot_messages`. |
| Dynamic XML Sitemap | `GET /sitemap.xml` | `SeoPublicController@sitemap` | Published pages, departments, news/events; excludes admin, login, and installer URLs. |
| Dynamic Robots.txt | `GET /robots.txt` | `SeoPublicController@robots` | Disallows configured admin login, control panel, `/install`, and `/api/`. |

---

## 2. Installation Endpoints (`/api/v1/install/*` — Locked After Install)

Protected by `EnsureNotInstalled` middleware (`403 Forbidden` with `{ code: "ALREADY_INSTALLED" }` once `installation_status.is_installed = true` or `storage/app/installed.lock` exists).

| Wizard Step | HTTP Method & Endpoint | Controller Method | Description |
| --- | --- | --- | --- |
| Check install lock state | `GET /api/v1/install/status` | `InstallController@status` | Returns `{ installed: boolean, appVersion: string }`. Never leaks secrets. |
| Step 2: System Requirements | `GET /api/v1/install/requirements` | `InstallController@requirements` | Inspects live PHP 8.3+ version, PDO/MySQL, mbstring, openssl, fileinfo, gd, curl, json, writable `storage/`, `bootstrap/cache/`, `.env` parent. |
| Step 3: Test cPanel MySQL DB | `POST /api/v1/install/test-database` | `InstallController@testDatabase` | Validates host/port/db/user/password via PDO handshake (`SELECT 1`). Returns connection status; never returns or logs password. |
| Step 6: Execute Installation | `POST /api/v1/install/execute` | `InstallController@execute` | Atomic transaction: verifies DB, writes `.env` safely, runs migrations (`Artisan::call('migrate', ['--force' => true])`), seeds roles/permissions/theme/default college config, creates initial Super Administrator with `Hash::make()`, sets `installation_status`, writes `installed.lock`. |

---

## 3. Authentication & Profile Endpoints (`/api/v1/auth/*`)

Protected by `NoIndexAdminHeaders` middleware (`X-Robots-Tag: noindex, nofollow`).

| Admin Auth Action | HTTP Method & Endpoint | Controller Method | Notes |
| --- | --- | --- | --- |
| CSRF handshake | `GET /api/v1/auth/csrf` (or `/sanctum/csrf-cookie`) | `AuthController@csrf` | Issues HTTP-only session + XSRF-TOKEN cookie. |
| Sign in (`AdminLogin`) | `POST /api/v1/auth/login` | `AuthController@login` | Rate-limited (`throttle:5,1`), accepts username or email + password, verifies `active = true`, regenerates session, logs `activity_logs`. |
| Current authenticated user | `GET /api/v1/auth/me` | `AuthController@me` | Returns current user + role + permission keys (`401` if unauthenticated). |
| Sign out | `POST /api/v1/auth/logout` | `AuthController@logout` | Invalidates session & regenerates CSRF token. |
| Forgot password request | `POST /api/v1/auth/forgot-password` | `AuthController@forgotPassword` | Generates hashed reset token in `password_reset_tokens` & mails via Laravel Mail (rate-limited). |
| Reset password with token | `POST /api/v1/auth/reset-password` | `AuthController@resetPassword` | Validates token + strong password + confirmation. |
| Update own profile | `PUT /api/v1/auth/profile` | `AuthController@updateProfile` | Authenticated user updates name/email. |
| Change own password | `PUT /api/v1/auth/change-password` | `AuthController@changePassword` | Verifies current password before hashing new password. |

---

## 4. Protected Admin CMS Endpoints (`/api/v1/admin/*`)

All endpoints require `auth:sanctum` (session cookie) + `CheckRolePermission` middleware + `NoIndexAdminHeaders`.

| Admin Module | Frontend Component | Endpoints Mapped | Permission Key |
| --- | --- | --- | --- |
| **Bootstrap & Dashboard** | `AdminDashboard` | `GET /api/v1/admin/bootstrap`, `GET /api/v1/admin/dashboard` | Authenticated admin |
| **Appearance & Themes** | `AppearanceThemeManager` | `GET /api/v1/admin/themes`, `POST /api/v1/admin/themes`, `PUT /api/v1/admin/themes/{id}`, `POST /api/v1/admin/themes/{id}/activate`, `DELETE /api/v1/admin/themes/{id}`, `PUT /api/v1/admin/appearance` | `appearance_management` |
| **Header & Footer** | `HeaderManager`, `FooterManager` | `PUT /api/v1/admin/header`, `PUT /api/v1/admin/footer` | `website_management` |
| **Navigation Menus** | `NavigationManager` | `GET /api/v1/admin/menus`, `PUT /api/v1/admin/menus` (bulk sync + reorder), `POST /api/v1/admin/menus/items`, `DELETE /api/v1/admin/menus/items/{id}` | `website_management` |
| **Pages & Visual Builder** | `PagesListManager`, `PageBuilderDetail` | `GET /api/v1/admin/pages`, `POST /api/v1/admin/pages`, `GET /api/v1/admin/pages/{id}`, `PUT /api/v1/admin/pages/{id}`, `POST /api/v1/admin/pages/{id}/duplicate`, `DELETE /api/v1/admin/pages/{id}`, `PUT /api/v1/admin/pages/{id}/sections/reorder` | `page_management` |
| **Sliders & Banners** | `SlidersManager`, `BannersManager` | `GET/POST /api/v1/admin/sliders`, `PUT/DELETE /api/v1/admin/sliders/{id}`, `PUT /api/v1/admin/sliders/reorder`, `GET/POST /api/v1/admin/banners`, `PUT/DELETE /api/v1/admin/banners/{id}` | `website_management` |
| **Media Library** | `MediaLibraryManager` | `GET /api/v1/admin/media`, `POST /api/v1/admin/media` (`multipart/form-data`), `PUT /api/v1/admin/media/{id}`, `DELETE /api/v1/admin/media/{id}`, `GET/POST /api/v1/admin/media-folders` | `website_management` |
| **Programs** | `ProgramsManager` | `GET/POST /api/v1/admin/programs`, `PUT/DELETE /api/v1/admin/programs/{id}` | `academic_content` |
| **Departments** | `DepartmentsManager` | `GET/POST /api/v1/admin/departments`, `PUT/DELETE /api/v1/admin/departments/{id}` | `academic_content` |
| **Faculty** | `FacultyManager` | `GET/POST /api/v1/admin/faculty`, `PUT/DELETE /api/v1/admin/faculty/{id}` | `academic_content` |
| **Admissions & Enquiries** | `AdmissionsManager`, `EnquiriesManager` | `PUT /api/v1/admin/admissions-settings`, `GET /api/v1/admin/enquiries` (paginated, search/program/status filter), `PUT /api/v1/admin/enquiries/{id}`, `POST /api/v1/admin/enquiries/{id}/notes`, `GET /api/v1/admin/enquiries/export` (CSV stream) | `admissions` |
| **News & Events** | `NewsEventsManager` | `GET/POST /api/v1/admin/news-events`, `PUT/DELETE /api/v1/admin/news-events/{id}` | `news` |
| **Achievements, Placements, Campus Life, Gallery, Testimonials, Downloads** | `ContentModulesManager` | `GET/POST/PUT/DELETE` for `/api/v1/admin/achievements`, `/placements`, `/campus-life`, `/gallery`, `/testimonials`, `/downloads` | `academic_content` / `news` |
| **Chatbot & FAQs** | `ChatbotSettingsManager`, `ChatbotFaqManager` | `PUT /api/v1/admin/chatbot/settings`, `GET/POST/PUT/DELETE /api/v1/admin/chatbot/faqs`, `GET /api/v1/admin/chatbot/conversations` | `chatbot` |
| **SEO & Contact/Social & Forms** | `SeoManager`, `ContactSocialManager`, `FormsManager` | `PUT /api/v1/admin/seo`, `PUT /api/v1/admin/contact-social`, `GET/PUT /api/v1/admin/forms/{id}` | `website_management` |
| **Users & Roles** | `UsersRolesManager` | `GET/POST/PUT/DELETE /api/v1/admin/users`, `GET /api/v1/admin/roles`, `PUT /api/v1/admin/roles/{id}` | `user_management` |
| **Settings, Notifications, Logs, Install Info** | `WebsiteSettingsManager`, `NotificationsManager`, `ActivityLogsManager`, `InstallInfoManager` | `PUT /api/v1/admin/settings`, `GET /api/v1/admin/notifications`, `POST /api/v1/admin/notifications/read-all`, `GET /api/v1/admin/activity-logs`, `GET /api/v1/admin/system-logs`, `GET /api/v1/admin/install-info` | `system_settings` |
