# cPanel Shared Hosting Deployment & Operations Guide

Target Environment: **cPanel Shared Hosting**, **Apache 2.4+ (`mod_rewrite`, `mod_headers`, `mod_deflate`)**, **PHP 8.3+ (PHP-FPM recommended)**, **MySQL 8.0+ / MariaDB 10.6+**, **AutoSSL / Let's Encrypt HTTPS**.

---

## 1. Recommended cPanel Directory Layout

Keep all Laravel application files, `.env`, `storage/`, and `vendor/` **outside** `public_html` so no configuration or PHP source files can ever be requested directly over HTTP:

```text
/home/CPANEL_USER/
├── application/              <-- Copy contents of backend/ here
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/               <-- Keep for CLI/artisan reference
│   ├── resources/
│   ├── routes/
│   ├── storage/              <-- Needs 775 / writable by PHP-FPM
│   ├── vendor/               <-- Installed via Composer or uploaded vendor.zip
│   ├── artisan
│   └── .env                  <-- Copied from .env.example (chmod 600)
└── public_html/              <-- Web document root
    ├── assets/               <-- Built Vite static JS/CSS/fonts
    ├── src/assets/images/    <-- Built institutional photography
    ├── uploads/              <-- Symlink (or copy target) to ../application/storage/app/public/uploads
    ├── index.html            <-- Built Vite SPA entry
    ├── index.php             <-- Front controller routing /api/*, /sitemap.xml, /robots.txt to Laravel
    └── .htaccess             <-- Apache rewrite & security rules
```

*(Alternative if your cPanel account allows changing Domain Document Root directly in **Domains -> Manage**: you may point the domain directly to `/home/CPANEL_USER/application/public` and place the Vite `dist/` assets inside `application/public/`.)*

---

## 2. Step-by-Step cPanel Deployment

### Step 1: Create MySQL Database in cPanel
1. Log into cPanel -> **MySQL Databases** (or **MySQL Database Wizard**).
2. Create database (cPanel automatically prefixes your username, e.g. `kitsuser_pharmacy`).
3. Create MySQL user (e.g. `kitsuser_admin`) with a strong random password.
4. Click **Add User to Database** -> check **ALL PRIVILEGES** -> **Make Changes**.

### Step 2: Upload Application & Build Static Frontend
Locally (on your workstation or CI):
```bash
npm install
npm run build
bash cpanel/package-cpanel.sh
```
This creates `cpanel-dist/application/` and `cpanel-dist/public_html/`.
1. Upload `cpanel-dist/application/*` into `/home/CPANEL_USER/application/`.
2. Upload `cpanel-dist/public_html/*` into `/home/CPANEL_USER/public_html/`.

### Step 3: Install PHP Composer Dependencies
- **With SSH / Terminal Access:**
  ```bash
  cd ~/application
  composer install --no-dev --optimize-autoloader
  ```
- **Without SSH (Shared Hosting No-SSH Fallback):**
  1. On your local machine (with PHP 8.3 & Composer installed), run inside `backend/`:
     ```bash
     composer install --no-dev --optimize-autoloader
     zip -r vendor.zip vendor/
     ```
  2. Upload `vendor.zip` to `/home/CPANEL_USER/application/` via cPanel **File Manager** and click **Extract**. Delete `vendor.zip` afterwards.

### Step 4: Configure PHP 8.3+ & Extensions
In cPanel -> **MultiPHP Manager**, select **PHP 8.3** (or 8.4) for your domain.  
In **Select PHP Version / PHP Selector**, ensure these extensions are enabled:
- `pdo_mysql`, `mysqli`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `fileinfo`, `gd`, `curl`, `zip`.

### Step 5: Configure Environment & File Permissions
1. Copy `/home/CPANEL_USER/application/.env.example` to `.env` (or let `/install/` write the database values cleanly).
2. Ensure `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://kitspharmacy.ac.in`, and a strong `APP_KEY` (`php artisan key:generate` or generated automatically by `/install/`).
3. Optional AI chatbot key: set `GEMINI_API_KEY=...` inside `.env` (never expose in frontend files).
4. Set directory permissions:
   - `chmod -R 775 /home/CPANEL_USER/application/storage`
   - `chmod -R 775 /home/CPANEL_USER/application/bootstrap/cache`
   - `chmod 600 /home/CPANEL_USER/application/.env`
5. Create uploads symlink (via SSH or cPanel Cron/symlink helper):
   ```bash
   ln -s /home/CPANEL_USER/application/storage/app/public /home/CPANEL_USER/public_html/storage
   ```

### Step 6: Enable SSL (HTTPS)
1. In cPanel -> **SSL/TLS Status**, run **AutoSSL** for `kitspharmacy.ac.in` and `www.kitspharmacy.ac.in`.
2. In cPanel -> **Domains**, enable **Force HTTPS Redirect**.

### Step 7: Run the Web Installation Wizard (`/install/`)
1. Navigate to `https://kitspharmacy.ac.in/install/`.
2. **Step 1 (Welcome)** -> click **Start Installation**.
3. **Step 2 (Requirements)** -> verify all PHP 8.3+, extensions, and writable directories pass.
4. **Step 3 (Database)** -> enter your cPanel MySQL host (`localhost`), port (`3306`), prefixed DB name (`kitsuser_pharmacy`), DB user, and password -> click **Test Connection**.
5. **Step 4 (Website Config)** -> verify title, URL (`https://kitspharmacy.ac.in`), Asia/Kolkata timezone, theme, and customizable admin URL slug (default `/admin-login` & `/control-panel`).
6. **Step 5 (Super Administrator)** -> enter Name, Email, Username, and strong Password.
7. **Step 6 & 7 (Execute & Complete)** -> runs migrations, creates the Super Administrator, seeds institutional baseline content (zero demo credentials), writes `storage/app/installed.lock`, and locks `/install/` permanently.

### CLI Fallback Installation (If Web Wizard Disabled)
```bash
cd ~/application
php artisan kits:install \
  --db-host=localhost --db-port=3306 --db-name=kitsuser_pharmacy \
  --db-user=kitsuser_admin --db-pass='STRONG_PASS' \
  --admin-name='Principal Admin' --admin-email='kitspharmacollege@gmail.com' \
  --admin-user='kits_superadmin'
```

---

## 3. Backup & Restore Procedures

### Manual / Scheduled Backup
1. **Database Backup** (cPanel -> phpMyAdmin -> Export SQL, or SSH/Cron):
   ```bash
   mysqldump -u kitsuser_admin -p kitsuser_pharmacy > ~/backups/kits_db_$(date +%F).sql
   ```
   *(Store backups in `~/backups/`, NEVER inside `public_html/`.)*
2. **Media & Config Backup**: Archive `/home/CPANEL_USER/application/storage/app/public` and `.env`.

### Restore
1. Re-upload `storage/app/public` and `.env`.
2. Restore MySQL dump via cPanel phpMyAdmin Import or:
   ```bash
   mysql -u kitsuser_admin -p kitsuser_pharmacy < ~/backups/kits_db_YYYY-MM-DD.sql
   ```

---

## 4. Verification Checklist After Launch
- [ ] `https://kitspharmacy.ac.in/` renders static React frontend cleanly with HTTPS padlock.
- [ ] Direct visit to `/departments/pharmaceutics` and `/admissions` works (Apache SPA fallback).
- [ ] `https://kitspharmacy.ac.in/.env` returns HTTP `403`/`404`.
- [ ] `/install/` returns `403/404` Installation Locked after completion.
- [ ] Zero Admin/CMS links visible in public header, topbar, footer, or `/sitemap.xml`.
- [ ] `/admin-login` authenticates with real MySQL user, sets HTTP-only cookie, enforces CSRF, and opens `/control-panel/`.
- [ ] Submitting an admission enquiry saves to MySQL and appears in `/control-panel/enquiries`.
- [ ] Theme color edit in `/control-panel/appearance` persists across browser reload on the public site.
