<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\ChatbotFaq;
use App\Models\ChatbotKeyword;
use App\Models\ChatbotSetting;
use App\Models\FormDefinition;
use App\Models\InstallationStatus;
use App\Models\NotificationItem;
use App\Models\Permission;
use App\Models\Role;
use App\Models\SeoSetting;
use App\Models\SiteSetting;
use App\Models\SocialLink;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminSystemController extends Controller
{
    use ApiResponse;

    public function updateChatbotSettings(Request $request): JsonResponse
    {
        $data = $request->validate([
            'enabled' => ['boolean'],
            'name' => ['required', 'string', 'max:120'],
            'avatarUrl' => ['nullable', 'string', 'max:500'],
            'welcomeMessage' => ['nullable', 'string', 'max:1000'],
            'primaryColor' => ['nullable', 'string', 'max:20'],
            'suggestedQuestions' => ['nullable', 'array'],
            'fallbackMessage' => ['nullable', 'string', 'max:1000'],
            'providerMode' => ['nullable', 'in:local_faq,backend_ai_adapter'],
        ]);

        ChatbotSetting::updateOrCreate(['id' => 1], [
            'enabled' => (bool) ($data['enabled'] ?? true),
            'name' => $data['name'],
            'avatar_url' => $data['avatarUrl'] ?? '',
            'welcome_message' => $data['welcomeMessage'] ?? '',
            'primary_color' => $data['primaryColor'] ?? '#52128B',
            'suggested_questions_json' => $data['suggestedQuestions'] ?? [],
            'fallback_message' => $data['fallbackMessage'] ?? '',
            'ai_enabled' => ($data['providerMode'] ?? 'local_faq') === 'backend_ai_adapter',
        ]);

        $this->log($request, 'Updated chatbot assistant configuration', 'Chatbot');
        return $this->ok(null, 'Chatbot settings saved.');
    }

    public function syncChatbotFaqs(Request $request): JsonResponse
    {
        $data = $request->validate(['faqs' => ['required', 'array']]);
        DB::transaction(function () use ($data) {
            ChatbotFaq::query()->delete();
            foreach ($data['faqs'] as $idx => $faq) {
                $record = ChatbotFaq::create([
                    'category_name' => $faq['category'] ?? 'College Information',
                    'question' => $faq['question'] ?? '',
                    'answer' => $faq['answer'] ?? '',
                    'enabled' => (bool) ($faq['enabled'] ?? true),
                    'sort_order' => $idx + 1,
                ]);
                foreach ($faq['keywords'] ?? [] as $kw) {
                    $clean = strtolower(trim((string) $kw));
                    if ($clean !== '') {
                        ChatbotKeyword::create(['faq_id' => $record->id, 'keyword' => $clean]);
                    }
                }
            }
        });
        $this->log($request, 'Synchronized chatbot FAQs', 'Chatbot');
        return $this->ok(null, 'Chatbot FAQs saved.');
    }

    public function updateSeo(Request $request): JsonResponse
    {
        $data = $request->validate([
            'siteTitle' => ['required', 'string', 'max:191'],
            'siteDescription' => ['nullable', 'string', 'max:500'],
            'defaultKeywords' => ['nullable', 'string', 'max:500'],
            'faviconUrl' => ['nullable', 'string', 'max:500'],
            'defaultOgImage' => ['nullable', 'string', 'max:500'],
            'robotsIndex' => ['boolean'],
            'enableSitemap' => ['boolean'],
            'enableBreadcrumbs' => ['boolean'],
            'enableStructuredData' => ['boolean'],
            'institutionType' => ['nullable', 'string', 'max:80'],
        ]);

        SeoSetting::updateOrCreate(['id' => 1], [
            'site_title' => $data['siteTitle'],
            'site_description' => $data['siteDescription'] ?? '',
            'default_keywords' => $data['defaultKeywords'] ?? '',
            'favicon_url' => $data['faviconUrl'] ?? '',
            'default_og_image' => $data['defaultOgImage'] ?? '',
            'robots_index' => (bool) ($data['robotsIndex'] ?? true),
            'enable_sitemap' => (bool) ($data['enableSitemap'] ?? true),
            'enable_breadcrumbs' => (bool) ($data['enableBreadcrumbs'] ?? true),
            'enable_structured_data' => (bool) ($data['enableStructuredData'] ?? true),
            'institution_type' => $data['institutionType'] ?? 'CollegeOrUniversity',
        ]);

        $this->log($request, 'Updated global SEO and structured data settings', 'SEO');
        return $this->ok(null, 'SEO settings saved.');
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $groups = ['general', 'branding', 'contact', 'integrations', 'maintenance'];
        DB::transaction(function () use ($request, $groups) {
            foreach ($groups as $group) {
                $payload = $request->input($group);
                if (is_array($payload)) {
                    foreach ($payload as $key => $value) {
                        SiteSetting::updateOrCreate(
                            ['group' => $group, 'key' => (string) $key],
                            [
                                'value' => is_bool($value) ? ($value ? '1' : '0') : (string) $value,
                                'updated_by' => $request->user()?->id,
                            ]
                        );
                    }
                }
            }

            if (is_array($request->input('social'))) {
                foreach ($request->input('social') as $platform => $url) {
                    SocialLink::updateOrCreate(
                        ['platform' => (string) $platform],
                        ['url' => (string) $url, 'is_active' => true]
                    );
                }
            }
        });

        $this->log($request, 'Updated website settings and contact configuration', 'Settings');
        return $this->ok(null, 'Settings saved.');
    }

    public function syncForms(Request $request): JsonResponse
    {
        $data = $request->validate(['forms' => ['required', 'array']]);
        DB::transaction(function () use ($data) {
            foreach ($data['forms'] as $f) {
                if (empty($f['slug'])) {
                    continue;
                }
                FormDefinition::updateOrCreate(
                    ['slug' => $f['slug']],
                    [
                        'name' => $f['name'] ?? 'Form',
                        'description' => $f['description'] ?? '',
                        'recipient_email' => $f['recipientEmail'] ?? '',
                        'submit_label' => $f['submitLabel'] ?? 'Submit',
                        'success_message' => $f['successMessage'] ?? 'Submitted!',
                        'fields_json' => $f['fields'] ?? [],
                        'active' => (bool) ($f['active'] ?? true),
                    ]
                );
            }
        });
        $this->log($request, 'Updated forms configuration', 'Forms');
        return $this->ok(null, 'Forms updated.');
    }

    public function storeUser(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'username' => ['required', 'string', 'alpha_dash', 'min:3', 'max:60', 'unique:users,username'],
            'email' => ['required', 'email', 'max:191', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'max:128'],
            'role' => ['required', 'string', 'exists:roles,name'],
            'active' => ['boolean'],
        ]);

        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'username' => $data['username'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'is_active' => (bool) ($data['active'] ?? true),
            ]);
            $role = Role::where('name', $data['role'])->firstOrFail();
            $user->roles()->sync([$role->id]);
            return $user;
        });

        $this->log($request, "Created admin user {$user->username} ({$data['role']})", 'Users');
        return $this->ok([
            'id' => (string) $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'role' => $data['role'],
            'active' => $user->is_active,
            'lastLogin' => 'Never',
        ], 'User created.', status: 201);
    }

    public function updateUser(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'min:2', 'max:120'],
            'email' => ['sometimes', 'email', 'max:191', 'unique:users,email,'.$user->id],
            'role' => ['sometimes', 'string', 'exists:roles,name'],
            'active' => ['sometimes', 'boolean'],
            'password' => ['nullable', 'string', 'min:8', 'max:128'],
        ]);

        if ((int) $request->user()?->id === $user->id && isset($data['active']) && $data['active'] === false) {
            return $this->fail('You cannot suspend your own active session.', 422);
        }

        $user->update([
            'name' => $data['name'] ?? $user->name,
            'email' => $data['email'] ?? $user->email,
            'is_active' => $data['active'] ?? $user->is_active,
            ...(!empty($data['password']) ? ['password' => Hash::make($data['password'])] : []),
        ]);

        if (!empty($data['role'])) {
            $role = Role::where('name', $data['role'])->firstOrFail();
            $user->roles()->sync([$role->id]);
        }

        $this->log($request, "Updated admin user {$user->username}", 'Users');
        return $this->ok(null, 'User updated.');
    }

    public function destroyUser(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        if ((int) $request->user()?->id === $user->id) {
            return $this->fail('You cannot delete your own account.', 422);
        }
        $username = $user->username;
        $user->delete();
        $this->log($request, "Deleted admin user {$username}", 'Users');
        return $this->ok(null, 'User deleted.');
    }

    public function updateRolePermissions(Request $request, int $id): JsonResponse
    {
        $role = Role::findOrFail($id);
        if ($role->slug === 'super-administrator') {
            return $this->fail('Super Administrator permissions cannot be restricted.', 422);
        }
        $data = $request->validate(['permissions' => ['required', 'array']]);
        $permIds = Permission::whereIn('key', $data['permissions'])->pluck('id')->all();
        $role->permissions()->sync($permIds);
        $this->log($request, "Updated permissions for {$role->name}", 'Roles');
        return $this->ok(null, 'Role permissions updated.');
    }

    public function markAllNotificationsRead(): JsonResponse
    {
        NotificationItem::where('is_read', false)->update(['is_read' => true]);
        return $this->ok(null, 'Notifications marked read.');
    }

    public function installInfo(): JsonResponse
    {
        $row = InstallationStatus::first();
        return $this->ok([
            'installed' => (bool) $row?->is_installed,
            'appVersion' => $row?->app_version ?? '2.0.0',
            'installedAt' => $row?->installed_at?->toIso8601String(),
            'installedByEmail' => $row?->installed_by_email,
            'adminLoginPath' => $row?->admin_login_path ?? '/admin-login',
            'adminPanelPath' => $row?->admin_panel_path ?? '/control-panel',
            'phpVersion' => PHP_VERSION,
            'databaseHost' => config('database.connections.mysql.host'),
            'databaseName' => config('database.connections.mysql.database'),
        ]);
    }

    protected function log(Request $request, string $action, string $module): void
    {
        $user = $request->user();
        if (!$user) {
            return;
        }
        ActivityLog::create([
            'user_id' => $user->id,
            'actor_name' => $user->name,
            'actor_role' => $user->primaryRoleName(),
            'action' => $action,
            'module' => $module,
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);
    }
}
