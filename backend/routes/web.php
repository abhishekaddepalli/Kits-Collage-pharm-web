<?php

use App\Http\Controllers\Api\V1\PublicSiteController;
use App\Models\InstallationStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/sitemap.xml', [PublicSiteController::class, 'sitemap']);
Route::get('/robots.txt', [PublicSiteController::class, 'robots']);

// React SPA Catch-All (adds noindex headers automatically on admin, login, and install URLs)
Route::get('/{any?}', function (Request $request) {
    $indexPath = public_path('index.html');
    if (!file_exists($indexPath)) {
        return response('Frontend build not found. Run npm run build and copy dist/ to public_html.', 503);
    }

    $response = response()->file($indexPath, ['Content-Type' => 'text/html; charset=UTF-8']);

    $path = '/'.ltrim($request->path(), '/');
    $loginPath = config('app.admin_login_path', '/admin-login');
    $panelPath = config('app.admin_panel_path', '/control-panel');

    try {
        if (class_exists(InstallationStatus::class)) {
            $status = InstallationStatus::first();
            if ($status) {
                $loginPath = $status->admin_login_path ?: $loginPath;
                $panelPath = $status->admin_panel_path ?: $panelPath;
            }
        }
    } catch (\Throwable) {
        // Pre-installation state
    }

    if (
        str_starts_with($path, $loginPath) ||
        str_starts_with($path, $panelPath) ||
        str_starts_with($path, '/install') ||
        str_starts_with($path, '/forgot-password') ||
        str_starts_with($path, '/reset-password')
    ) {
        $response->headers->set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    }

    return $response;
})->where('any', '.*');
