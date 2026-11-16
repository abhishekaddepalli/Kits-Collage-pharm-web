<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\InstitutionalBaselineSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class KitsCmsSecurityAndApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeder_never_creates_default_admin_users(): void
    {
        app(InstitutionalBaselineSeeder::class)->seed();

        $this->assertDatabaseCount('users', 0);
        $this->assertDatabaseHas('roles', ['slug' => 'super-administrator']);
    }

    public function test_unauthenticated_requests_to_admin_endpoints_are_rejected(): void
    {
        app(InstitutionalBaselineSeeder::class)->seed();

        $this->getJson('/api/v1/admin/dashboard')->assertStatus(401);
        $this->putJson('/api/v1/admin/seo', ['siteTitle' => 'Tamper'])->assertStatus(401);
        $this->postJson('/api/v1/admin/users', ['username' => 'hacker'])->assertStatus(401);
    }

    public function test_installer_endpoints_reject_execution_once_installed(): void
    {
        file_put_contents(storage_path('app/installed.lock'), json_encode(['installed_at' => now()->toIso8601String()]));

        $this->getJson('/api/v1/install/status')->assertOk()->assertJsonPath('data.installed', true);
        $this->postJson('/api/v1/install/execute', [])->assertStatus(403)->assertJsonPath('code', 'ALREADY_INSTALLED');

        @unlink(storage_path('app/installed.lock'));
    }

    public function test_public_enquiry_submission_persists_to_database(): void
    {
        file_put_contents(storage_path('app/installed.lock'), json_encode(['installed_at' => now()->toIso8601String()]));
        app(InstitutionalBaselineSeeder::class)->seed();

        $response = $this->postJson('/api/v1/public/enquiries', [
            'studentName' => 'Sravani Reddy',
            'mobile' => '+91 9876543210',
            'interestedProgram' => 'Bachelor of Pharmacy (B.Pharmacy)',
            'city' => 'Kakinada',
        ]);

        $response->assertStatus(201)->assertJsonPath('success', true);
        $this->assertDatabaseHas('admission_enquiries', ['student_name' => 'Sravani Reddy', 'status' => 'New']);

        @unlink(storage_path('app/installed.lock'));
    }

    public function test_sitemap_and_robots_exclude_admin_and_installer_paths(): void
    {
        file_put_contents(storage_path('app/installed.lock'), json_encode(['installed_at' => now()->toIso8601String()]));
        app(InstitutionalBaselineSeeder::class)->seed();

        $robots = $this->get('/robots.txt')->assertOk()->getContent();
        $this->assertStringContainsString('Disallow: /admin-login', $robots);
        $this->assertStringContainsString('Disallow: /control-panel/', $robots);
        $this->assertStringContainsString('Disallow: /install', $robots);

        $sitemap = $this->get('/sitemap.xml')->assertOk()->getContent();
        $this->assertStringNotContainsString('/admin-login', $sitemap);
        $this->assertStringNotContainsString('/control-panel', $sitemap);
        $this->assertStringNotContainsString('/install', $sitemap);

        @unlink(storage_path('app/installed.lock'));
    }
}
