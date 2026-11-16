<?php

namespace App\Console\Commands;

use App\Http\Middleware\EnsureInstalled;
use App\Services\InstallationService;
use Illuminate\Console\Command;

class KitsInstallCommand extends Command
{
    protected $signature = 'kits:install';

    protected $description = 'Run the non-public CLI installation wizard for KITS College of Pharmacy CMS.';

    public function handle(InstallationService $installer): int
    {
        if (EnsureInstalled::isInstalled()) {
            $this->error('Application is already installed. Re-installation via CLI is disabled.');
            return self::FAILURE;
        }

        $this->info('KITS College of Pharmacy for Women — Server CLI Installer');

        $host = $this->ask('MySQL Host', '127.0.0.1');
        $port = $this->ask('MySQL Port', '3306');
        $database = $this->ask('MySQL Database Name');
        $username = $this->ask('MySQL Username');
        $password = $this->secret('MySQL Password') ?? '';

        $websiteName = $this->ask('Website Name', 'KITS College of Pharmacy for Women');
        $websiteUrl = $this->ask('Primary Domain URL', 'https://kitspharmacy.ac.in');
        $adminLoginPath = $this->ask('Admin Login Path', '/admin-login');
        $adminPanelPath = $this->ask('Admin Control Panel Path', '/control-panel');

        $fullName = $this->ask('Super Administrator Full Name');
        $email = $this->ask('Super Administrator Email');
        $adminUsername = $this->ask('Super Administrator Username');
        $adminPassword = $this->secret('Super Administrator Password (min 8 chars)');
        $confirm = $this->secret('Confirm Super Administrator Password');

        if ($adminPassword !== $confirm || strlen((string) $adminPassword) < 8) {
            $this->error('Passwords do not match or are shorter than 8 characters.');
            return self::FAILURE;
        }

        $result = $installer->executeInstallation([
            'database' => compact('host', 'port', 'database', 'username', 'password'),
            'website' => compact('websiteName', 'websiteUrl', 'adminLoginPath', 'adminPanelPath'),
            'admin' => [
                'fullName' => $fullName,
                'email' => $email,
                'username' => $adminUsername,
                'password' => $adminPassword,
            ],
        ]);

        $this->info("Installation complete! Admin Login: {$result['adminLoginPath']} | Panel: {$result['adminPanelPath']}");

        return self::SUCCESS;
    }
}
