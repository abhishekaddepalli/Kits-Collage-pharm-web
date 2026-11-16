<?php

namespace App\Services;

use App\Http\Middleware\EnsureInstalled;
use App\Models\ActivityLog;
use App\Models\InstallationStatus;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use PDO;

class InstallationService
{
    public function checkRequirements(): array
    {
        $extensions = [
            ['key' => 'php_version', 'label' => 'PHP 8.3+', 'ok' => version_compare(PHP_VERSION, '8.3.0', '>='), 'current' => PHP_VERSION],
            ['key' => 'pdo_mysql', 'label' => 'PDO MySQL Extension', 'ok' => extension_loaded('pdo_mysql'), 'current' => extension_loaded('pdo_mysql') ? 'Loaded' : 'Missing'],
            ['key' => 'mbstring', 'label' => 'Mbstring Extension', 'ok' => extension_loaded('mbstring'), 'current' => extension_loaded('mbstring') ? 'Loaded' : 'Missing'],
            ['key' => 'openssl', 'label' => 'OpenSSL Extension', 'ok' => extension_loaded('openssl'), 'current' => extension_loaded('openssl') ? 'Loaded' : 'Missing'],
            ['key' => 'json', 'label' => 'JSON Extension', 'ok' => extension_loaded('json'), 'current' => extension_loaded('json') ? 'Loaded' : 'Missing'],
            ['key' => 'fileinfo', 'label' => 'Fileinfo Extension', 'ok' => extension_loaded('fileinfo'), 'current' => extension_loaded('fileinfo') ? 'Loaded' : 'Missing'],
            ['key' => 'gd', 'label' => 'GD Image Extension', 'ok' => extension_loaded('gd'), 'current' => extension_loaded('gd') ? 'Loaded' : 'Missing'],
            ['key' => 'curl', 'label' => 'cURL Extension', 'ok' => extension_loaded('curl'), 'current' => extension_loaded('curl') ? 'Loaded' : 'Missing'],
            ['key' => 'storage_writable', 'label' => 'storage/ Writable', 'ok' => is_writable(storage_path()), 'current' => is_writable(storage_path()) ? 'Writable' : 'Not Writable'],
            ['key' => 'cache_writable', 'label' => 'bootstrap/cache/ Writable', 'ok' => is_writable(base_path('bootstrap/cache')), 'current' => is_writable(base_path('bootstrap/cache')) ? 'Writable' : 'Not Writable'],
        ];

        $allPassed = collect($extensions)->every(fn (array $item) => $item['ok']);

        return [
            'allPassed' => $allPassed,
            'checks' => $extensions,
            'phpVersion' => PHP_VERSION,
        ];
    }

    public function testDatabaseConnection(array $dbConfig): array
    {
        $host = $dbConfig['host'] ?? '127.0.0.1';
        $port = (int) ($dbConfig['port'] ?? 3306);
        $database = $dbConfig['database'] ?? '';
        $username = $dbConfig['username'] ?? '';
        $password = $dbConfig['password'] ?? '';

        $dsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";
        $pdo = new PDO($dsn, $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 5,
        ]);

        $version = $pdo->query('SELECT VERSION()')->fetchColumn();

        return [
            'connected' => true,
            'serverVersion' => (string) $version,
            'database' => $database,
        ];
    }

    public function executeInstallation(array $payload): array
    {
        if (EnsureInstalled::isInstalled()) {
            throw new \RuntimeException('Application is already installed.');
        }

        // 1. Validate live MySQL database handshake first
        $this->testDatabaseConnection($payload['database']);

        // 2. Normalize configurable Admin URL paths safely
        $adminLoginPath = $this->normalizeRoutePath($payload['website']['adminLoginPath'] ?? '/admin-login', '/admin-login');
        $adminPanelPath = $this->normalizeRoutePath($payload['website']['adminPanelPath'] ?? '/control-panel', '/control-panel');

        // 3. Persist runtime .env configuration cleanly
        $this->writeEnvironmentFile([
            'APP_NAME' => $payload['website']['websiteName'] ?? 'KITS College of Pharmacy for Women',
            'APP_ENV' => 'production',
            'APP_DEBUG' => 'false',
            'APP_URL' => rtrim($payload['website']['websiteUrl'] ?? 'https://kitspharmacy.ac.in', '/'),
            'APP_KEY' => config('app.key') ?: 'base64:'.base64_encode(random_bytes(32)),
            'APP_ADMIN_LOGIN_PATH' => $adminLoginPath,
            'APP_ADMIN_PANEL_PATH' => $adminPanelPath,
            'DB_HOST' => $payload['database']['host'],
            'DB_PORT' => (string) ($payload['database']['port'] ?? 3306),
            'DB_DATABASE' => $payload['database']['database'],
            'DB_USERNAME' => $payload['database']['username'],
            'DB_PASSWORD' => $payload['database']['password'] ?? '',
        ]);

        // 4. Reconfigure active database connection for current request
        Config::set('database.connections.mysql.host', $payload['database']['host']);
        Config::set('database.connections.mysql.port', $payload['database']['port'] ?? 3306);
        Config::set('database.connections.mysql.database', $payload['database']['database']);
        Config::set('database.connections.mysql.username', $payload['database']['username']);
        Config::set('database.connections.mysql.password', $payload['database']['password'] ?? '');
        DB::purge('mysql');

        // 5. Run all database migrations
        Artisan::call('migrate', ['--force' => true]);

        // 6. Seed institutional defaults + RBAC roles/permissions (no admin user)
        app(InstitutionalBaselineSeeder::class)->seed($payload['website'] ?? []);

        // 7. Create ONLY the first Super Administrator from installer input
        $adminUser = DB::transaction(function () use ($payload, $adminLoginPath, $adminPanelPath) {
            $superRole = Role::where('slug', 'super-administrator')->firstOrFail();

            $user = User::create([
                'name' => $payload['admin']['fullName'],
                'username' => $payload['admin']['username'],
                'email' => $payload['admin']['email'],
                'password' => Hash::make($payload['admin']['password']),
                'is_active' => true,
            ]);
            $user->roles()->sync([$superRole->id]);

            InstallationStatus::updateOrCreate(
                ['id' => 1],
                [
                    'is_installed' => true,
                    'app_version' => '2.0.0',
                    'admin_login_path' => $adminLoginPath,
                    'admin_panel_path' => $adminPanelPath,
                    'installed_at' => now(),
                    'installed_by_email' => $user->email,
                ]
            );

            ActivityLog::create([
                'user_id' => $user->id,
                'actor_name' => $user->name,
                'actor_role' => 'Super Administrator',
                'action' => 'Completed initial server installation and created Super Administrator account',
                'module' => 'Installer',
                'ip_address' => request()?->ip(),
                'created_at' => now(),
            ]);

            return $user;
        });

        // 8. Permanently write file-system lock to disable installer endpoints
        if (!is_dir(storage_path('app'))) {
            mkdir(storage_path('app'), 0755, true);
        }
        file_put_contents(storage_path('app/installed.lock'), json_encode([
            'installed_at' => now()->toIso8601String(),
            'version' => '2.0.0',
            'admin_login_path' => $adminLoginPath,
            'admin_panel_path' => $adminPanelPath,
        ], JSON_PRETTY_PRINT));

        return [
            'installed' => true,
            'adminLoginPath' => $adminLoginPath,
            'adminPanelPath' => $adminPanelPath,
            'superAdminEmail' => $adminUser->email,
        ];
    }

    protected function normalizeRoutePath(string $input, string $fallback): string
    {
        $clean = '/'.trim(preg_replace('/[^a-zA-Z0-9\-\/]/', '', $input) ?: '', '/');
        return $clean === '/' ? $fallback : $clean;
    }

    protected function writeEnvironmentFile(array $updates): void
    {
        $envPath = base_path('.env');
        $examplePath = base_path('.env.example');

        if (!file_exists($envPath) && file_exists($examplePath)) {
            copy($examplePath, $envPath);
        }

        $content = file_exists($envPath) ? file_get_contents($envPath) : '';

        foreach ($updates as $key => $value) {
            $escaped = str_contains((string) $value, ' ') || str_contains((string) $value, '#')
                ? '"'.str_replace('"', '\"', (string) $value).'"'
                : (string) $value;

            $pattern = "/^{$key}=.*/m";
            $line = "{$key}={$escaped}";

            if (preg_match($pattern, $content)) {
                $content = preg_replace($pattern, $line, $content);
            } else {
                $content .= PHP_EOL.$line;
            }
        }

        file_put_contents($envPath, ltrim($content));
    }
}
