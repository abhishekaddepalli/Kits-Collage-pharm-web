<?php

return [
    'name' => env('APP_NAME', 'KITS College of Pharmacy for Women'),
    'env' => env('APP_ENV', 'production'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url' => env('APP_URL', 'https://kitspharmacy.ac.in'),
    'timezone' => env('APP_TIMEZONE', 'Asia/Kolkata'),
    'locale' => 'en',
    'fallback_locale' => 'en',
    'key' => env('APP_KEY'),
    'cipher' => 'AES-256-CBC',
    'admin_login_path' => env('APP_ADMIN_LOGIN_PATH', '/admin-login'),
    'admin_panel_path' => env('APP_ADMIN_PANEL_PATH', '/control-panel'),
];
