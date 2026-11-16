# KITS College of Pharmacy for Women — Verification & Test Report

**Date:** 2026-11-16  
**Scope:** Full-stack cPanel-ready PHP 12 / Laravel / MySQL backend architecture, local Express + Vite preview API parity server (`server.ts`), security hardening (zero demo credentials + installer lock + hidden admin URLs), and static React/Vite frontend build.

---

## 1. Automated Verification Summary

| Check | Command / Tool | Result | Notes |
|---|---|---|---|
| TypeScript Static Typecheck | `npm run lint` (`tsc --noEmit`) | **PASS (0 errors)** | Covers `src/` frontend and `server.ts` preview API. |
| Production Static Build | `npm run build` (`vite build`) | **PASS** | Emits static assets to `dist/` with no Node runtime dependency. |
| Pure Logic Unit Tests | `npx --yes tsx --test src/utils/logic.test.ts` | **PASS (4 / 4)** | Verifies demo-free baseline, chatbot engine matching, Zod validation schemas, and theme CSS computation. |
| cPanel Release Packager | `bash cpanel/package-cpanel.sh` | **PASS** | Produces clean split `cpanel-dist/application/` & `cpanel-dist/public_html/` without dev files. |
| Playwright E2E (Chromium) | Headless Chromium (`1440x900` & `390x844`) | **PASS** | Completed 2 verification rounds across all 3 core user journeys with **0 console errors/warnings** on public pages. |
| Laravel PHPUnit Suite | `php artisan test` (`backend/tests/Feature/KitsCmsSecurityAndApiTest.php`) | **NOT EXECUTED IN CONTAINER** | Container lacks `php`, `composer`, and `mysql` binaries; static PHP code written and ready for staging/cPanel PHP 8.3+. |

---

## 2. Playwright End-to-End Journeys Executed

### Journey 1 — Guided 7-Step Installer & Permanent One-Time Lock
- Verified un-installed startup state returns `installed: false` from `GET /api/v1/install/status` without throwing console errors on `/` or `/install`.
- Walked through Steps 1–7 in `/install`:
  - Step 2 verified environment requirements (`POST /api/v1/install/requirements`).
  - Step 3 validated required MySQL connection inputs (`host`, `database`, `username`) and verified `POST /api/v1/install/test-database`.
  - Step 4 preserved configurable private admin routes (`/admin-login`, `/control-panel`).
  - Step 5 verified all Super Administrator fields start **completely empty** (zero demo credentials or prefilled passwords) and created a custom Super Administrator.
  - Step 6 executed installation (`POST /api/v1/install/execute`) and landed on Step 7 (`/install/complete`).
- Verified permanent lock:
  - Revisiting `/install` renders **"Installation Already Completed & Locked"** with web installer controls disabled.
  - Direct `POST /api/v1/install/execute` returned **HTTP 403**.

### Journey 2 — Public Website Visual Preservation, Privacy & SEO
- Inspected desktop (`1440x900`) and mobile (`390x844`) screenshots against the existing KITS College of Pharmacy for Women visual design (`#52128B` Royal Purple, `#F2C34E` Gold, Playfair Display + Plus Jakarta Sans, institutional ribbon, campus cards, and mobile navigation bar).
- Audited every rendered anchor (`<a href>`) on public pages: **0** links to `/admin-login`, `/control-panel`, `/install`, or any `Staff Portal` / `CMS Admin` text.
- Verified `0` horizontal overflow on both desktop (`1440px`) and mobile (`390px`).
- Verified `/robots.txt` disallows `/admin-login`, `/control-panel/`, `/admin`, `/install`, `/api/`, `/sanctum/`.
- Verified `/sitemap.xml` includes only public routes and published CMS pages, excluding admin/login/installer routes.
- Verified HTTP `X-Robots-Tag: noindex, nofollow, noarchive` response header on `/admin-login`, `/control-panel`, and `/install`.

### Journey 3 — Authentication Security, Admin Persistence, Admissions CRM & Chatbot
- Verified unauthenticated access to `/control-panel` redirects cleanly to `/admin-login`.
- Verified `/admin-login` contains zero demo credential hints, sample accounts, or demo login buttons.
- Verified incorrect password rejection, followed by authenticated sign-in with the newly created Super Administrator account.
- Verified Control Panel Dashboard renders live database counts (`0` enquiries before submissions, no fake sample trends or sample rows).
- Updated theme color in `/control-panel/appearance`, reloaded `/`, and verified live CSS variable `--kits-primary` updated and persisted before restoring the official `#52128B` palette.
- Submitted a real admission enquiry on `/admissions` (`Ananya Reddy`), confirmed generated `ENQ-...` reference code, verified `KITS AI Assistant` answered via `POST /api/v1/chatbot/message`, confirmed the enquiry appeared inside `/control-panel/enquiries`, and verified `GET /api/v1/admin/enquiries/export` returned HTTP `200` CSV data.

---

## 3. Environment Limitations & Pre-Go-Live Verification on cPanel
Because the build container runs Node.js + Chromium without `php`, `composer`, or `mysql` server binaries, run the following verification commands on your target cPanel host or PHP 8.3+ / MySQL 8.0+ staging server after uploading `cpanel-dist/`:

1. Install Laravel vendor packages (`composer install --no-dev --optimize-autoloader`).
2. Copy `backend/.env.example` to `backend/.env`, set `APP_KEY` via `php artisan key:generate`, and configure `APP_URL`, `SESSION_DOMAIN`, and MySQL credentials.
3. Run migrations & feature tests in staging: `php artisan test`.
4. Launch `https://your-domain.com/install` once to provision production MySQL tables, seed baseline data, and create the sole production Super Administrator.
