<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\AdmissionEnquiry;
use App\Models\Banner;
use App\Models\ChatbotFaq;
use App\Models\ChatbotMessage;
use App\Models\FooterSetting;
use App\Models\HeaderSetting;
use App\Models\Media;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\NewsItem;
use App\Models\NotificationItem;
use App\Models\Page;
use App\Models\PageRevision;
use App\Models\PageSection;
use App\Models\Slider;
use App\Models\SliderItem;
use App\Models\Theme;
use App\Models\ThemeSetting;
use App\Services\BootstrapStateService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminCmsController extends Controller
{
    use ApiResponse;

    public function bootstrap(BootstrapStateService $service): JsonResponse
    {
        return $this->ok($service->adminBootstrap());
    }

    public function dashboard(): JsonResponse
    {
        $totalEnquiries = AdmissionEnquiry::count();
        $newEnquiries = AdmissionEnquiry::where('status', 'New')->count();
        $convertedEnquiries = AdmissionEnquiry::where('status', 'Converted')->count();
        $publishedPages = Page::where('status', 'published')->count();
        $totalPages = Page::count();
        $mediaCount = Media::count();
        $newsCount = NewsItem::count();
        $faqCount = ChatbotFaq::where('enabled', true)->count();
        $chatbotTotalQueries = ChatbotMessage::where('sender', 'user')->count();
        $unreadNotifications = NotificationItem::where('is_read', false)->count();

        // Real monthly enquiry trend from MySQL (last 6 months, zero synthetic numbers)
        $monthlyTrend = AdmissionEnquiry::select(
            DB::raw("DATE_FORMAT(created_at, '%b %Y') as month"),
            DB::raw('COUNT(*) as enquiries')
        )
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderByRaw('MIN(created_at) ASC')
            ->get();

        $programBreakdown = AdmissionEnquiry::select('interested_program as program', DB::raw('COUNT(*) as count'))
            ->groupBy('interested_program')
            ->orderByDesc('count')
            ->get();

        return $this->ok([
            'kpis' => [
                'totalEnquiries' => $totalEnquiries,
                'newEnquiries' => $newEnquiries,
                'convertedEnquiries' => $convertedEnquiries,
                'publishedPages' => $publishedPages,
                'totalPages' => $totalPages,
                'mediaCount' => $mediaCount,
                'newsCount' => $newsCount,
                'faqCount' => $faqCount,
                'chatbotTotalQueries' => $chatbotTotalQueries,
                'unreadNotifications' => $unreadNotifications,
            ],
            'monthlyTrend' => $monthlyTrend,
            'programBreakdown' => $programBreakdown,
        ]);
    }

    public function updateAppearance(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'activeThemeId' => ['required', 'string', 'max:80'],
            'palette' => ['required', 'array'],
            'typography' => ['required', 'array'],
            'layout' => ['required', 'array'],
            'customThemes' => ['nullable', 'array'],
        ]);

        DB::transaction(function () use ($validated) {
            Theme::query()->update(['is_active' => false]);
            $theme = Theme::updateOrCreate(
                ['slug' => $validated['activeThemeId']],
                [
                    'name' => $validated['palette']['name'] ?? $validated['activeThemeId'],
                    'is_active' => true,
                    'palette_json' => $validated['palette'],
                ]
            );

            ThemeSetting::updateOrCreate(
                ['theme_id' => $theme->id],
                [
                    'typography_json' => $validated['typography'],
                    'layout_json' => $validated['layout'],
                ]
            );

            foreach ($validated['customThemes'] ?? [] as $custom) {
                if (!empty($custom['id'])) {
                    Theme::updateOrCreate(
                        ['slug' => $custom['id']],
                        [
                            'name' => $custom['name'] ?? 'Custom Theme',
                            'is_preset' => false,
                            'is_active' => $custom['id'] === $validated['activeThemeId'],
                            'palette_json' => $custom,
                        ]
                    );
                }
            }
        });

        $this->logActivity($request, 'Updated appearance palette, typography, and layout', 'Appearance');

        return $this->ok(null, 'Appearance saved to database.');
    }

    public function updateHeader(Request $request): JsonResponse
    {
        $data = $request->validate([
            'collegeName' => ['required', 'string', 'max:120'],
            'collegeSubtitle' => ['required', 'string', 'max:191'],
            'locationShort' => ['nullable', 'string', 'max:255'],
            'affiliationText' => ['nullable', 'string', 'max:191'],
            'approvalText' => ['nullable', 'string', 'max:191'],
            'phone' => ['nullable', 'string', 'max:40'],
            'secondaryPhone' => ['nullable', 'string', 'max:40'],
            'email' => ['nullable', 'email', 'max:191'],
            'workingHours' => ['nullable', 'string', 'max:120'],
            'announcementText' => ['nullable', 'string', 'max:500'],
            'announcementLink' => ['nullable', 'string', 'max:300'],
            'showAnnouncement' => ['boolean'],
            'examPortalLabel' => ['nullable', 'string', 'max:80'],
            'examPortalUrl' => ['nullable', 'string', 'max:300'],
            'studentPortalLabel' => ['nullable', 'string', 'max:80'],
            'studentPortalUrl' => ['nullable', 'string', 'max:300'],
            'defaultLanguage' => ['nullable', 'string', 'max:40'],
            'applyButtonLabel' => ['nullable', 'string', 'max:80'],
            'applyButtonPath' => ['nullable', 'string', 'max:200'],
            'logoUrl' => ['nullable', 'string', 'max:500'],
            'headerBg' => ['nullable', 'string', 'max:20'],
            'headerTextColor' => ['nullable', 'string', 'max:20'],
            'navBg' => ['nullable', 'string', 'max:20'],
            'navTextColor' => ['nullable', 'string', 'max:20'],
            'sticky' => ['boolean'],
        ]);

        HeaderSetting::updateOrCreate(['id' => 1], [
            'college_name' => $data['collegeName'],
            'college_subtitle' => $data['collegeSubtitle'],
            'location_short' => $data['locationShort'] ?? '',
            'affiliation_text' => $data['affiliationText'] ?? '',
            'approval_text' => $data['approvalText'] ?? '',
            'phone' => $data['phone'] ?? '',
            'secondary_phone' => $data['secondaryPhone'] ?? '',
            'email' => $data['email'] ?? '',
            'working_hours' => $data['workingHours'] ?? '',
            'announcement_text' => $data['announcementText'] ?? '',
            'announcement_link' => $data['announcementLink'] ?? '',
            'show_announcement' => (bool) ($data['showAnnouncement'] ?? true),
            'exam_portal_label' => $data['examPortalLabel'] ?? '',
            'exam_portal_url' => $data['examPortalUrl'] ?? '',
            'student_portal_label' => $data['studentPortalLabel'] ?? '',
            'student_portal_url' => $data['studentPortalUrl'] ?? '',
            'default_language' => $data['defaultLanguage'] ?? 'English',
            'apply_button_label' => $data['applyButtonLabel'] ?? 'Apply Now',
            'apply_button_path' => $data['applyButtonPath'] ?? '/admissions',
            'logo_url' => $data['logoUrl'] ?? 'svg-emblem',
            'header_bg' => $data['headerBg'] ?? '#FFFFFF',
            'header_text_color' => $data['headerTextColor'] ?? '#171238',
            'nav_bg' => $data['navBg'] ?? '#32105B',
            'nav_text_color' => $data['navTextColor'] ?? '#FFFFFF',
            'sticky' => (bool) ($data['sticky'] ?? true),
        ]);

        $this->logActivity($request, 'Updated header branding and top bar configuration', 'Header');

        return $this->ok(null, 'Header settings saved.');
    }

    public function updateFooter(Request $request): JsonResponse
    {
        $data = $request->validate([
            'logoUrl' => ['nullable', 'string', 'max:500'],
            'introText' => ['nullable', 'string', 'max:1000'],
            'columns' => ['nullable', 'array'],
            'address' => ['nullable', 'string', 'max:500'],
            'phone' => ['nullable', 'string', 'max:40'],
            'email' => ['nullable', 'email', 'max:191'],
            'copyrightText' => ['nullable', 'string', 'max:300'],
            'backgroundColor' => ['nullable', 'string', 'max:20'],
            'textColor' => ['nullable', 'string', 'max:20'],
            'customBlockTitle' => ['nullable', 'string', 'max:191'],
            'customBlockContent' => ['nullable', 'string', 'max:1000'],
        ]);

        FooterSetting::updateOrCreate(['id' => 1], [
            'logo_url' => $data['logoUrl'] ?? 'svg-emblem',
            'intro_text' => $data['introText'] ?? '',
            'columns_json' => $data['columns'] ?? [],
            'address' => $data['address'] ?? '',
            'phone' => $data['phone'] ?? '',
            'email' => $data['email'] ?? '',
            'copyright_text' => $data['copyrightText'] ?? '',
            'background_color' => $data['backgroundColor'] ?? '#171238',
            'text_color' => $data['textColor'] ?? '#EAE4F5',
            'custom_block_title' => $data['customBlockTitle'] ?? '',
            'custom_block_content' => $data['customBlockContent'] ?? '',
        ]);

        $this->logActivity($request, 'Updated footer layout and columns', 'Footer');

        return $this->ok(null, 'Footer settings saved.');
    }

    public function syncNavigation(Request $request): JsonResponse
    {
        $data = $request->validate([
            'items' => ['required', 'array'],
        ]);

        DB::transaction(function () use ($data) {
            $menu = Menu::firstOrCreate(
                ['slug' => 'primary-nav'],
                ['location' => 'primary', 'name' => 'Primary Website Navigation']
            );
            $menu->items()->delete();
            MenuItem::where('menu_id', $menu->id)->delete();

            foreach ($data['items'] as $idx => $item) {
                $parent = MenuItem::create([
                    'menu_id' => $menu->id,
                    'label' => $item['label'] ?? 'Link',
                    'path' => $item['path'] ?? '/',
                    'sort_order' => $item['order'] ?? ($idx + 1),
                    'enabled' => (bool) ($item['enabled'] ?? true),
                    'open_in_new_tab' => (bool) ($item['openInNewTab'] ?? false),
                ]);

                foreach ($item['children'] ?? [] as $cIdx => $child) {
                    MenuItem::create([
                        'menu_id' => $menu->id,
                        'parent_id' => $parent->id,
                        'label' => $child['label'] ?? 'Sublink',
                        'path' => $child['path'] ?? '/',
                        'sort_order' => $child['order'] ?? ($cIdx + 1),
                        'enabled' => (bool) ($child['enabled'] ?? true),
                        'open_in_new_tab' => (bool) ($child['openInNewTab'] ?? false),
                    ]);
                }
            }
        });

        $this->logActivity($request, 'Synchronized navigation menu items', 'Navigation');

        return $this->ok(null, 'Navigation saved.');
    }

    public function storePage(Request $request, BootstrapStateService $serializer): JsonResponse
    {
        $data = $this->validatePage($request);

        $page = DB::transaction(function () use ($request, $data) {
            $page = Page::create([
                'title' => $data['title'],
                'slug' => Str::slug($data['slug']),
                'status' => $data['status'],
                'scheduled_at' => $data['scheduledAt'] ?? null,
                'enabled' => (bool) ($data['enabled'] ?? true),
                'seo_title' => $data['seoTitle'] ?? $data['title'],
                'seo_description' => $data['seoDescription'] ?? '',
                'updated_by' => $request->user()?->id,
            ]);

            $this->syncPageSections($page, $data['sections'] ?? []);
            return $page->load('sections');
        });

        $this->logActivity($request, "Created page {$page->title}", 'Pages');

        return $this->ok($serializer->serializePage($page), 'Page created.', status: 201);
    }

    public function updatePage(Request $request, int $id, BootstrapStateService $serializer): JsonResponse
    {
        $page = Page::with('sections')->findOrFail($id);
        $data = $this->validatePage($request, $page->id);

        DB::transaction(function () use ($request, $page, $data) {
            PageRevision::create([
                'page_id' => $page->id,
                'snapshot_json' => $page->toArray(),
                'created_by' => $request->user()?->id,
                'created_at' => now(),
            ]);

            $page->update([
                'title' => $data['title'],
                'slug' => Str::slug($data['slug']),
                'status' => $data['status'],
                'scheduled_at' => $data['scheduledAt'] ?? null,
                'enabled' => (bool) ($data['enabled'] ?? true),
                'seo_title' => $data['seoTitle'] ?? $data['title'],
                'seo_description' => $data['seoDescription'] ?? '',
                'updated_by' => $request->user()?->id,
            ]);

            $this->syncPageSections($page, $data['sections'] ?? []);
        });

        $page->load('sections');
        $this->logActivity($request, "Updated page {$page->title}", 'Pages');

        return $this->ok($serializer->serializePage($page), 'Page updated.');
    }

    public function destroyPage(Request $request, int $id): JsonResponse
    {
        $page = Page::findOrFail($id);
        if ($page->is_system_route) {
            return $this->fail('Core system pages cannot be deleted. You may edit or disable them.', 422);
        }
        $title = $page->title;
        $page->delete();
        $this->logActivity($request, "Deleted page {$title}", 'Pages');

        return $this->ok(null, 'Page deleted.');
    }

    public function syncSliders(Request $request): JsonResponse
    {
        $data = $request->validate(['sliders' => ['required', 'array']]);

        DB::transaction(function () use ($data) {
            $slider = Slider::firstOrCreate(
                ['slug' => 'home-hero'],
                ['name' => 'Homepage Hero Carousel', 'is_active' => true]
            );
            $slider->items()->delete();

            foreach ($data['sliders'] as $idx => $s) {
                SliderItem::create([
                    'slider_id' => $slider->id,
                    'badge' => $s['badge'] ?? '',
                    'heading' => $s['heading'] ?? 'KITS Pharmacy',
                    'highlighted_text' => $s['highlightedText'] ?? '',
                    'subheading' => $s['subheading'] ?? '',
                    'description' => $s['description'] ?? '',
                    'desktop_image' => $s['desktopImage'] ?? '/src/assets/images/hero_pharmacy_lab_1794818460854.jpg',
                    'mobile_image' => $s['mobileImage'] ?? ($s['desktopImage'] ?? ''),
                    'image_alt' => $s['imageAlt'] ?? '',
                    'primary_cta_label' => $s['primaryCtaLabel'] ?? '',
                    'primary_cta_link' => $s['primaryCtaLink'] ?? '/admissions',
                    'secondary_cta_label' => $s['secondaryCtaLabel'] ?? '',
                    'secondary_cta_link' => $s['secondaryCtaLink'] ?? '/academics',
                    'overlay_opacity' => (float) ($s['overlayOpacity'] ?? 80),
                    'text_position' => $s['textPosition'] ?? 'left',
                    'animation' => $s['animation'] ?? 'fade',
                    'duration_ms' => (int) ($s['durationMs'] ?? 6000),
                    'sort_order' => (int) ($s['order'] ?? ($idx + 1)),
                    'active' => (bool) ($s['active'] ?? true),
                    'start_date' => !empty($s['startDate']) ? $s['startDate'] : null,
                    'end_date' => !empty($s['endDate']) ? $s['endDate'] : null,
                    'video_url' => $s['videoUrl'] ?? null,
                ]);
            }
        });

        $this->logActivity($request, 'Updated hero slider items', 'Sliders');

        return $this->ok(null, 'Sliders updated.');
    }

    public function syncBanners(Request $request): JsonResponse
    {
        $data = $request->validate(['banners' => ['required', 'array']]);

        DB::transaction(function () use ($data) {
            Banner::query()->delete();
            foreach ($data['banners'] as $b) {
                Banner::create([
                    'title' => $b['title'] ?? 'Admissions Banner',
                    'subtitle' => $b['subtitle'] ?? '',
                    'cta_label' => $b['ctaLabel'] ?? 'Learn More',
                    'cta_link' => $b['ctaLink'] ?? '/admissions',
                    'image_url' => $b['imageUrl'] ?? '',
                    'placement' => $b['placement'] ?? 'homepage',
                    'active' => (bool) ($b['active'] ?? true),
                ]);
            }
        });

        $this->logActivity($request, 'Updated promotional banners', 'Banners');

        return $this->ok(null, 'Banners saved.');
    }

    public function uploadMedia(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,svg,pdf,mp4', 'max:15360'],
            'title' => ['nullable', 'string', 'max:191'],
            'altText' => ['nullable', 'string', 'max:191'],
            'folder' => ['nullable', 'string', 'max:80'],
        ]);

        $file = $request->file('file');
        $folder = preg_replace('/[^a-zA-Z0-9_-]/', '', (string) $request->input('folder', 'Campus')) ?: 'Campus';
        $storedPath = $file->store("uploads/{$folder}", 'public');
        $publicUrl = Storage::disk('public')->url($storedPath);

        $mime = (string) $file->getMimeType();
        $type = str_contains($mime, 'pdf') ? 'pdf' : (str_contains($mime, 'video') ? 'video' : 'image');
        $bytes = $file->getSize();
        $label = $bytes > 1048576 ? round($bytes / 1048576, 2).' MB' : max(1, round($bytes / 1024)).' KB';

        $media = Media::create([
            'folder_name' => $folder,
            'title' => $request->input('title') ?: pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
            'alt_text' => $request->input('altText') ?: $file->getClientOriginalName(),
            'type' => $type,
            'disk_path' => $storedPath,
            'public_url' => $publicUrl,
            'mime_type' => $mime,
            'file_size_bytes' => $bytes,
            'file_size_label' => $label,
            'uploaded_by' => $request->user()?->id,
        ]);

        $this->logActivity($request, "Uploaded media asset {$media->title}", 'Media');

        return $this->ok([
            'id' => (string) $media->id,
            'title' => $media->title,
            'altText' => $media->alt_text,
            'type' => $media->type,
            'folder' => $media->folder_name,
            'url' => $media->public_url,
            'fileSize' => $media->file_size_label,
            'uploadedAt' => $media->created_at?->format('Y-m-d'),
        ], 'File uploaded successfully.', status: 201);
    }

    public function updateMedia(Request $request, int $id): JsonResponse
    {
        $media = Media::findOrFail($id);
        $data = $request->validate([
            'title' => ['required', 'string', 'max:191'],
            'altText' => ['nullable', 'string', 'max:191'],
            'folder' => ['nullable', 'string', 'max:80'],
        ]);

        $media->update([
            'title' => $data['title'],
            'alt_text' => $data['altText'] ?? '',
            'folder_name' => $data['folder'] ?? $media->folder_name,
        ]);

        return $this->ok(null, 'Media metadata updated.');
    }

    public function destroyMedia(Request $request, int $id): JsonResponse
    {
        $media = Media::findOrFail($id);
        if ($media->disk_path && Storage::disk('public')->exists($media->disk_path)) {
            Storage::disk('public')->delete($media->disk_path);
        }
        $title = $media->title;
        $media->delete();
        $this->logActivity($request, "Deleted media asset {$title}", 'Media');

        return $this->ok(null, 'Media asset deleted.');
    }

    protected function validatePage(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:191'],
            'slug' => ['required', 'string', 'max:160', 'unique:pages,slug'.($ignoreId ? ",{$ignoreId}" : '')],
            'status' => ['required', 'in:published,draft,scheduled'],
            'scheduledAt' => ['nullable', 'date'],
            'enabled' => ['boolean'],
            'seoTitle' => ['nullable', 'string', 'max:191'],
            'seoDescription' => ['nullable', 'string', 'max:500'],
            'sections' => ['nullable', 'array'],
        ]);
    }

    protected function syncPageSections(Page $page, array $sections): void
    {
        $page->sections()->delete();
        foreach ($sections as $idx => $sec) {
            PageSection::create([
                'page_id' => $page->id,
                'type' => $sec['type'] ?? 'text',
                'title' => $sec['title'] ?? '',
                'subtitle' => $sec['subtitle'] ?? null,
                'body' => $sec['body'] ?? null,
                'image_url' => $sec['imageUrl'] ?? null,
                'image_alt' => $sec['imageAlt'] ?? null,
                'background' => $sec['background'] ?? 'default',
                'padding_y' => $sec['paddingY'] ?? 'md',
                'hidden' => (bool) ($sec['hidden'] ?? false),
                'sort_order' => (int) ($sec['order'] ?? ($idx + 1)),
                'cta_label' => $sec['ctaLabel'] ?? null,
                'cta_link' => $sec['ctaLink'] ?? null,
                'items_json' => $sec['items'] ?? [],
            ]);
        }
    }

    protected function logActivity(Request $request, string $action, string $module): void
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
