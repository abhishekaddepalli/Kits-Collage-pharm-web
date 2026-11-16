<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

/*
|--------------------------------------------------------------------------
| cPanel Split-Directory Front Controller (/home/USER/public_html/index.php)
| Points securely to Laravel core outside web root: /home/USER/application/
|--------------------------------------------------------------------------
*/
$applicationBase = dirname(__DIR__) . '/application';

if (file_exists($maintenance = $applicationBase . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $applicationBase . '/vendor/autoload.php';

$app = require_once $applicationBase . '/bootstrap/app.php';
$app->usePublicPath(__DIR__);

$app->handleRequest(Request::capture());
