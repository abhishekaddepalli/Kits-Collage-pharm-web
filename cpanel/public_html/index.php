<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

/*
|--------------------------------------------------------------------------
| cPanel Front Controller (/home/USER/public_html/index.php or subdomain root)
| Dynamically locates Laravel core and serves the React SPA frontend safely
|--------------------------------------------------------------------------
*/

// 1. Locate Laravel backend directory dynamically
$candidatePaths = [
    __DIR__ . '/backend',                  // Subdomain root: /home/USER/subdomain/backend
    dirname(__DIR__) . '/application',      // Standard split: /home/USER/application
    dirname(__DIR__) . '/backend',          // Parent backend folder
    __DIR__ . '/../application',
];

$applicationBase = null;
foreach ($candidatePaths as $candidate) {
    if (file_exists($candidate . '/bootstrap/app.php')) {
        $applicationBase = realpath($candidate);
        break;
    }
}

// 2. Handle frontend SPA routes directly if index.html exists
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($requestUri, PHP_URL_PATH) ?: '/';
$isApiRoute = (bool) preg_match('#^/(api|sanctum|sitemap\.xml|robots\.txt)#', $path);

if (!$isApiRoute && file_exists(__DIR__ . '/index.html')) {
    if (preg_match('#^/(admin-login|control-panel|install|forgot-password|reset-password)#', $path)) {
        header('X-Robots-Tag: noindex, nofollow, noarchive');
    }
    header('Content-Type: text/html; charset=UTF-8');
    readfile(__DIR__ . '/index.html');
    exit;
}

if (!$applicationBase) {
    http_response_code(500);
    die("<h3>Configuration Error: Laravel Core Not Found</h3><p>Could not locate the <code>backend/</code> directory. Checked: " . htmlspecialchars(implode(', ', $candidatePaths)) . "</p>");
}

// 3. Ensure required runtime cache directories exist with write permissions
$runtimeDirs = [
    $applicationBase . '/bootstrap/cache',
    $applicationBase . '/storage/framework/cache',
    $applicationBase . '/storage/framework/sessions',
    $applicationBase . '/storage/framework/views',
    $applicationBase . '/storage/app/public/uploads',
    $applicationBase . '/storage/logs',
];
foreach ($runtimeDirs as $dir) {
    if (!is_dir($dir)) {
        @mkdir($dir, 0775, true);
    }
}

// 4. Ensure .env exists (copy from .env.example if missing)
if (!file_exists($applicationBase . '/.env') && file_exists($applicationBase . '/.env.example')) {
    @copy($applicationBase . '/.env.example', $applicationBase . '/.env');
}

// 5. Ensure Composer autoloader exists
if (!file_exists($applicationBase . '/vendor/autoload.php')) {
    http_response_code(500);
    die("<h3>Backend Setup Incomplete</h3><p>Run <code>composer install --no-dev</code> inside <code>" . htmlspecialchars($applicationBase) . "</code> to install dependencies.</p>");
}

if (file_exists($maintenance = $applicationBase . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $applicationBase . '/vendor/autoload.php';

$app = require_once $applicationBase . '/bootstrap/app.php';
$app->usePublicPath(__DIR__);

$app->handleRequest(Request::capture());
