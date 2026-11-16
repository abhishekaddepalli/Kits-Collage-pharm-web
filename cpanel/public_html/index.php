<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

/*
|--------------------------------------------------------------------------
| cPanel Front Controller (/home/USER/public_html/index.php or subdomain root)
| Dynamically locates Laravel core in standard split or subdomain structures
|--------------------------------------------------------------------------
*/
$candidatePaths = [
    dirname(__DIR__) . '/application',      // Standard split: /home/USER/application
    __DIR__ . '/backend',                  // Subdomain root: /home/USER/subdomain/backend
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

if (!$applicationBase) {
    http_response_code(500);
    die("Configuration error: Laravel core application directory could not be located. Checked: " . implode(', ', $candidatePaths));
}

if (file_exists($maintenance = $applicationBase . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $applicationBase . '/vendor/autoload.php';

$app = require_once $applicationBase . '/bootstrap/app.php';
$app->usePublicPath(__DIR__);

$app->handleRequest(Request::capture());
