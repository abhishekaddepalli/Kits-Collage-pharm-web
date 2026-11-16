# 🏛️ KITS College of Pharmacy for Women — Web Portal & CMS

<div align="center">

![KITS Pharmacy Banner](https://img.shields.io/badge/KITS-College%20of%20Pharmacy%20for%20Women-52128B?style=for-the-badge&logoColor=F2C34E)
![Designed by Infiniforge](https://img.shields.io/badge/Designed%20%26%20Engineered%20By-Infiniforge%20Technologies-F2C34E?style=for-the-badge&labelColor=171238)

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x%20%2F%207.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Laravel](https://img.shields.io/badge/Laravel-11%20%2F%2012-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com/)
[![PHP](https://img.shields.io/badge/PHP-8.3%2B-777BB4?style=flat-square&logo=php&logoColor=white)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![cPanel Ready](https://img.shields.io/badge/Deployment-cPanel%20Git%20Version%20Control-FF6C2C?style=flat-square&logo=cpanel&logoColor=white)](https://cpanel.net/)

<p align="center">
  <strong>Official Institutional Website, Administrative Control Panel, Self-Hosted 7-Step Installation Wizard, and KITS AI Assistant.</strong><br>
  <em>Approved by PCI (Pharmacy Council of India) & AICTE | Affiliated with JNTU Kakinada | Peddapuram Mandal, Kakinada District, AP.</em>
</p>

---

**Developed & Maintained with Excellence by [Infiniforge Technologies](https://github.com/abhishekaddepalli).**

</div>

---

## 📑 Table of Contents

1. [Institutional Profile](#-institutional-profile)
2. [Architecture Overview](#-architecture-overview)
3. [Key Features](#-key-features)
4. [Security Architecture & Zero-Demo Baseline](#-security-architecture--zero-demo-baseline)
5. [cPanel Git Version Control Setup & Deployment Guide](#-cpanel-git-version-control-setup--deployment-guide)
6. [Local Development Guide](#-local-development-guide)
7. [Repository File Map](#-repository-file-map)
8. [Credits & Attribution](#-credits--attribution)

---

## 🏛️ Institutional Profile

- **College Name:** KITS College of Pharmacy for Women
- **Campus Location:** Tirupati (V), Divili, Peddapuram Mandal, Kakinada District, Andhra Pradesh – 533433
- **Affiliations & Approvals:** Pharmacy Council of India (PCI), New Delhi; AICTE, New Delhi; Affiliated to Jawaharlal Nehru Technological University Kakinada (JNTUK)
- **Primary Color Identity:** Royal Purple (`#52128B`), Deep Velvet (`#32105B`), Rich Dark Plum (`#171238`), Gold Accent (`#F2C34E`), Magenta Glow (`#B21A83`)
- **Official Programs:** B.Pharmacy (Bachelor of Pharmacy — 4 Years), M.Pharmacy (Pharmaceutics & Pharmaceutical Analysis — 2 Years)

---

## 🏗️ Architecture Overview

The application features a **hybrid architecture** engineered specifically for standard **cPanel Shared Hosting** environments while maintaining a rapid local preview development workflow:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        PUBLIC CLIENT BROWSER                           │
│     (React 19 SPA • Tailwind CSS v4 • Lucide • Motion • Recharts)      │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
   [Local Dev Environment]                   [Production cPanel Hosting]
  Node.js / Express (:3000)                  Apache 2.4+ / PHP 8.3+ FPM
  ┌─────────────────────────┐               ┌─────────────────────────────┐
  │ server.ts Express API   │               │ /public_html/               │
  │ • Vite Middleware       │               │ • dist/ (React SPA bundle)  │
  │ • Dev DB (.kits-dev-db) │               │ • index.php (Front gateway) │
  │ • Dev Uploads           │               │ • .htaccess (Security rewrites)
  └─────────────────────────┘               └──────────────┬──────────────┘
                                                           │
                                            ┌──────────────┴──────────────┐
                                            │ /home/USER/application/     │
                                            │ (Strictly Outside Web Root) │
                                            │ • Laravel 11/12 REST API    │
                                            │ • .env (chmod 600)          │
                                            │ • MySQL 8.0+ Database       │
                                            └─────────────────────────────┘
```

---

## 🌟 Key Features

### 1. Public Institutional Portal
- **Hero Slider & Ribbon:** Dynamic slides with college milestones, accredited certifications, and admissions announcements.
- **Academic Programs:** Detailed curriculums, eligibility criteria, seat intakes, and fee structures for B.Pharmacy and M.Pharmacy.
- **Department Showcases:** 6 academic departments (Pharmaceutics, Pharmacology, Pharmaceutical Chemistry, Pharmacognosy, Pharmacy Practice, Pharmaceutical Analysis) with assigned faculty.
- **Interactive Admissions Enquiry:** Multi-step enquiry form with instant reference code generation and server validation.
- **KITS AI Assistant:** Intelligent floating chatbot answering admissions, courses, facilities, and contact questions, with optional server-side Google Gemini AI fallback.
- **Campus Life & Facilities:** High-resolution galleries, medicinal garden showcase, labs, central library, and seminar hall presentations.

### 2. Administrative CMS (`/control-panel`)
- **Visual Page Builder:** Create and customize modular pages using 16 block types.
- **Appearance & Theme Customizer:** 5 pre-tuned color palettes + live custom theme generator with desktop, tablet, and mobile viewport preview.
- **Admissions CRM:** Paginated lead management, custom status tags (`New`, `Contacted`, `Counseling`, `Admitted`, `Declined`), follow-up tracking, internal counsellor notes, and one-click CSV export.
- **Role-Based Access Control (RBAC):** Super Administrator, Content Administrator, Admissions Officer, and Academic Editor roles with fine-grained granular permissions.
- **Media Library:** Folder-based media management with server-side validation and responsive image delivery.

### 3. Guided 7-Step Installation Wizard (`/install`)
- **Step 1:** Institutional Welcome & System Overview.
- **Step 2:** Server environment validation (PHP 8.3+, PDO MySQL, file permissions, upload limits).
- **Step 3:** Live MySQL database handshake test without logging credentials.
- **Step 4:** College branding, default theme selection, and customizable private administration URLs.
- **Step 5:** First-time Super Administrator registration (starts completely empty, zero demo accounts).
- **Step 6 & 7:** Database migration, baseline institutional seeder, and permanent lock file generation.

---

## 🛡️ Security Architecture & Zero-Demo Baseline

- **Zero Hardcoded Credentials:** No demo credentials, hardcoded passwords, or bypass buttons exist in the codebase.
- **Configurable Private Admin Routes:** Admin login (`/admin-login`) and control panel (`/control-panel`) paths can be customized during installation or via environment variables.
- **Anti-Index Protection:** `robots.txt`, dynamic `sitemap.xml`, and HTTP headers (`X-Robots-Tag: noindex, nofollow, noarchive`) completely prevent search engines from discovering administrative routes.
- **CSRF & Session Security:** HTTP-only, `SameSite=Lax` session cookies paired with `XSRF-TOKEN` headers protect all non-GET requests.
- **Password Protection:** Passwords hashed with `scrypt` with cryptographic salts.
- **Split-Directory Deployment:** Laravel application code and `.env` files reside in `/home/USER/application/`, completely outside `public_html/`.

---

## 🚀 cPanel Git Version Control Setup & Deployment Guide

This project is pre-configured with [`.cpanel.yml`](.cpanel.yml) for automated deployment using cPanel's native **Git™ Version Control**.

### Prerequisites in cPanel:
1. **PHP Version:** Set to **PHP 8.3** or **PHP 8.4** via cPanel **MultiPHP Manager**.
2. **PHP Extensions:** Enable in **Select PHP Version**: `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `fileinfo`, `gd`, `curl`, `zip`.
3. **Database:** Create a MySQL database and user via cPanel **MySQL Database Wizard**.

---

### Step 1: Create a MySQL Database in cPanel
1. Open cPanel and navigate to **MySQL Database Wizard** (or **MySQL Databases**).
2. Create a new database: e.g., `username_kitspharmacy`.
3. Create a new user: e.g., `username_kitsadmin` with a strong password.
4. Add the user to the database and check **ALL PRIVILEGES**. Note down your DB Name, DB User, and DB Password.

---

### Step 2: Clone Repository via cPanel Git™ Version Control
1. In cPanel, navigate to **Files** ➡️ **Git™ Version Control**.
2. Click **Create** (or **Clone Repository**).
3. Set the following fields:
   - **Clone URL:** `https://github.com/abhishekaddepalli/Kits-Collage-pharm-web.git`
   - **Repository Path:** `repositories/Kits-Collage-pharm-web` (recommended inside your home directory).
   - **Repository Name:** `Kits-Collage-pharm-web`
4. Click **Create**. cPanel will clone the repository.

---

### Step 3: Automated Deployment via `.cpanel.yml`
1. Once cloned, click **Manage** next to `Kits-Collage-pharm-web` in **Git™ Version Control**.
2. Open the **Deploy** tab.
3. Click **Deploy Head Commit**.
   - cPanel reads [`.cpanel.yml`](.cpanel.yml) and automatically:
     - Deploys pre-compiled static assets and front controller into `/home/USER/public_html/`.
     - Copies Laravel backend files into `/home/USER/application/`.
     - Sets up storage directories and required permissions (`775`).

---

### Step 4: Install PHP Dependencies
- **Via cPanel Terminal / SSH:**
  ```bash
  cd ~/application
  composer install --no-dev --optimize-autoloader
  php artisan key:generate
  ```
- **If SSH/Terminal is not available on shared hosting:**
  Run `composer install --no-dev` on your local computer inside `backend/`, compress the generated `vendor/` folder into `vendor.zip`, upload it to `/home/USER/application/` via cPanel **File Manager**, and extract it.

---

### Step 5: Configure Storage Symlink
Run via Terminal or create a one-time Cron Job in cPanel:
```bash
ln -s /home/$USER/application/storage/app/public /home/$USER/public_html/storage
```

---

### Step 6: Run the Installation Wizard
1. Open your browser and visit:
   ```text
   https://yourdomain.com/install
   ```
2. Follow the 7-step wizard:
   - Verify environment requirements pass.
   - Enter your cPanel MySQL Database credentials (Host: `localhost`, Name, User, Password) and click **Test Connection**.
   - Set up your custom Admin URL paths.
   - Enter your Super Administrator credentials.
3. Click **Execute Installation**. The wizard migrates the database, seeds institutional defaults, creates the Super Administrator, and locks the installer permanently!

---

## 💻 Local Development Guide

### Prerequisites
- Node.js `v20+` or `v24+`
- npm `10+` or `11+`

### 1. Clone & Install
```bash
git clone https://github.com/abhishekaddepalli/Kits-Collage-pharm-web.git
cd Kits-Collage-pharm-web
npm install --legacy-peer-deps
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Start Local Dev Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

- **Installer Wizard:** [http://localhost:3000/install](http://localhost:3000/install)
- **Admin Login:** [http://localhost:3000/admin-login](http://localhost:3000/admin-login)
- **Admin Control Panel:** [http://localhost:3000/control-panel](http://localhost:3000/control-panel)

### 4. Build & Verify
```bash
npm run lint          # Run TypeScript type check
npm test              # Run unit test suite
npm run build         # Build production bundle into dist/
```

---

## 📁 Repository File Map

```text
Kits-Collage-pharm-web/
├── .cpanel.yml                     # cPanel automated Git deployment configuration
├── .env.example                    # Local and production environment template
├── .gitignore                      # Git ignore manifest
├── index.html                      # HTML entry with SEO and author meta tags
├── package.json                    # Project dependencies and npm scripts
├── server.ts                       # Local Express preview server & API parity runtime
├── tsconfig.json                   # TypeScript compiler configuration
├── vite.config.ts                  # Vite build and asset bundler configuration
│
├── backend/                        # Production Laravel 11/12 PHP Core
│   ├── app/                        # Controllers, Models, Middleware, Services
│   ├── config/                     # Framework configurations
│   ├── database/                   # 7 full database migrations & seeders
│   └── routes/api.php              # REST API route definitions (/api/v1/*)
│
├── cpanel/                         # cPanel deployment templates & helpers
│   ├── public_html/
│   │   ├── .htaccess               # Apache rewrite & HTTPS security rules
│   │   └── index.php               # Split-directory front controller
│   └── package-cpanel.sh           # Manual tarball packaging script
│
├── dist/                           # Compiled production React SPA distribution
│
├── docs/                           # Architectural specifications & audit logs
│   ├── API_MAPPING.md              # REST API endpoint inventory
│   ├── CPANEL_DEPLOYMENT.md        # Comprehensive cPanel deployment documentation
│   ├── DATABASE_SCHEMA.md          # Complete MySQL schema reference
│   ├── FRONTEND_AUDIT.md           # Security audit & frontend inventory
│   └── TEST_REPORT.md              # End-to-end automated verification report
│
└── src/                            # React 19 Frontend Application
    ├── admin/                      # CMS Administration modules & dashboard
    ├── app/                        # Context providers (CmsContext)
    ├── assets/                     # Institutional images & photography
    ├── components/                 # Layout, Chatbot, and common UI components
    ├── data/                       # Default seed data & theme definitions
    ├── pages/                      # Public institutional pages & /install wizard
    ├── services/                   # Typed API clients & installation service
    └── utils/                      # Validation, chatbot engine, and store logic
```

---

## 💎 Credits & Attribution

- **Platform Engineering & UI/UX Design:** **[Infiniforge Technologies](https://github.com/abhishekaddepalli)**
- **Institutional Authority:** **KITS College of Pharmacy for Women** (Divili, Andhra Pradesh)
- **Technical Architecture:** Modern React 19 SPA + Laravel 12 API + cPanel Git Version Control Integration

---

<div align="center">
  <sub>© 2026 KITS College of Pharmacy for Women. Designed & Developed by <strong>Infiniforge Technologies</strong>. All rights reserved.</sub>
</div>
