<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Middleware\EnsureInstalled;
use App\Models\InstallationStatus;
use App\Services\InstallationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InstallController extends Controller
{
    use ApiResponse;

    public function status(): JsonResponse
    {
        $installed = EnsureInstalled::isInstalled();
        $row = null;
        if ($installed) {
            try {
                $row = InstallationStatus::first();
            } catch (\Throwable) {
                $row = null;
            }
        }

        return $this->ok([
            'installed' => $installed,
            'appVersion' => $row?->app_version ?? '2.0.0',
            'adminLoginPath' => $installed ? ($row?->admin_login_path ?? '/admin-login') : '/admin-login',
            'adminPanelPath' => $installed ? ($row?->admin_panel_path ?? '/control-panel') : '/control-panel',
        ]);
    }

    public function requirements(InstallationService $installer): JsonResponse
    {
        return $this->ok($installer->checkRequirements());
    }

    public function testDatabase(Request $request, InstallationService $installer): JsonResponse
    {
        $validated = $request->validate([
            'host' => ['required', 'string', 'max:191'],
            'port' => ['required', 'integer', 'min:1', 'max:65535'],
            'database' => ['required', 'string', 'max:120'],
            'username' => ['required', 'string', 'max:120'],
            'password' => ['nullable', 'string', 'max:191'],
        ]);

        try {
            $result = $installer->testDatabaseConnection($validated);
            return $this->ok($result, 'MySQL database handshake succeeded.');
        } catch (\Throwable $e) {
            return $this->fail('Database connection failed: '.$e->getMessage(), 422);
        }
    }

    public function execute(Request $request, InstallationService $installer): JsonResponse
    {
        $validated = $request->validate([
            'database.host' => ['required', 'string', 'max:191'],
            'database.port' => ['required', 'integer', 'min:1', 'max:65535'],
            'database.database' => ['required', 'string', 'max:120'],
            'database.username' => ['required', 'string', 'max:120'],
            'database.password' => ['nullable', 'string', 'max:191'],
            'website.websiteName' => ['required', 'string', 'max:191'],
            'website.websiteUrl' => ['required', 'url', 'max:255'],
            'website.contactEmail' => ['required', 'email', 'max:191'],
            'website.contactPhone' => ['required', 'string', 'max:40'],
            'website.adminLoginPath' => ['nullable', 'string', 'max:80'],
            'website.adminPanelPath' => ['nullable', 'string', 'max:80'],
            'admin.fullName' => ['required', 'string', 'min:2', 'max:120'],
            'admin.email' => ['required', 'email', 'max:191'],
            'admin.username' => ['required', 'string', 'alpha_dash', 'min:3', 'max:60'],
            'admin.password' => ['required', 'string', 'min:8', 'max:128', 'confirmed'],
        ]);

        try {
            $result = $installer->executeInstallation($validated);
            return $this->ok($result, 'Installation completed successfully and installer is now locked.', status: 201);
        } catch (\Throwable $e) {
            return $this->fail('Installation failed: '.$e->getMessage(), 422);
        }
    }
}
