<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AdmissionEnquiry;
use App\Models\Department;
use App\Models\EventItem;
use App\Models\FormDefinition;
use App\Models\FormSubmission;
use App\Models\InstallationStatus;
use App\Models\NewsItem;
use App\Models\NotificationItem;
use App\Models\Page;
use App\Models\SeoSetting;
use App\Services\BootstrapStateService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

class PublicSiteController extends Controller
{
    use ApiResponse;

    public function bootstrap(BootstrapStateService $service): JsonResponse
    {
        return $this->ok($service->publicBootstrap());
    }

    public function page(string $slug, BootstrapStateService $service): JsonResponse
    {
        $page = Page::where('slug', $slug)
            ->where('status', 'published')
            ->where('enabled', true)
            ->with('sections')
            ->first();

        if (!$page) {
            return $this->fail('Page not found.', 404);
        }

        return $this->ok($service->serializePage($page));
    }

    public function department(string $slug): JsonResponse
    {
        $dept = Department::where('slug', $slug)->where('active', true)->with(['faculty' => fn ($q) => $q->where('active', true)])->first();

        if (!$dept) {
            return $this->fail('Department not found.', 404);
        }

        return $this->ok([
            'id' => (string) $dept->id,
            'slug' => $dept->slug,
            'name' => $dept->name,
            'shortDescription' => $dept->short_description,
            'introduction' => $dept->introduction,
            'iconName' => $dept->icon_name,
            'imageUrl' => $dept->image_url,
            'imageAlt' => $dept->image_alt,
            'facilities' => $dept->facilities_json ?? [],
            'laboratories' => $dept->laboratories_json ?? [],
            'researchAreas' => $dept->research_areas_json ?? [],
            'publications' => $dept->publications_json ?? [],
            'faculty' => $dept->faculty,
        ]);
    }

    public function news(Request $request): JsonResponse
    {
        $type = $request->query('type');
        $search = trim((string) $request->query('search', ''));

        $news = NewsItem::where('status', 'published')
            ->when($type && $type !== 'event', fn ($q) => $q->where('type', $type))
            ->when($search !== '', fn ($q) => $q->where('title', 'like', "%{$search}%"))
            ->latest('published_at')
            ->get();

        $events = $type && $type !== 'event'
            ? collect()
            : EventItem::where('status', 'published')
                ->when($search !== '', fn ($q) => $q->where('title', 'like', "%{$search}%"))
                ->latest('event_date')
                ->get();

        return $this->ok(['news' => $news, 'events' => $events]);
    }

    public function submitEnquiry(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'studentName' => ['required', 'string', 'min:2', 'max:120'],
            'parentName' => ['nullable', 'string', 'max:120'],
            'mobile' => ['required', 'string', 'regex:/^[0-9+\-\s()]{10,20}$/'],
            'email' => ['nullable', 'email', 'max:191'],
            'interestedProgram' => ['required', 'string', 'max:160'],
            'qualification' => ['nullable', 'string', 'max:160'],
            'city' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'message' => ['nullable', 'string', 'max:1500'],
        ]);

        $refCode = 'ENQ-'.strtoupper(Str::random(6));

        $enquiry = AdmissionEnquiry::create([
            'reference_code' => $refCode,
            'student_name' => $validated['studentName'],
            'parent_name' => $validated['parentName'] ?? null,
            'mobile' => $validated['mobile'],
            'email' => $validated['email'] ?? null,
            'interested_program' => $validated['interestedProgram'],
            'qualification' => $validated['qualification'] ?? null,
            'city' => $validated['city'] ?? null,
            'state' => $validated['state'] ?? 'Andhra Pradesh',
            'message' => $validated['message'] ?? null,
            'status' => 'New',
            'ip_address' => $request->ip(),
        ]);

        NotificationItem::create([
            'title' => 'New Admission Enquiry Received',
            'message' => "{$enquiry->student_name} enquired about {$enquiry->interested_program} ({$enquiry->mobile}).",
            'type' => 'enquiry',
            'is_read' => false,
            'link' => '/enquiries',
        ]);

        return $this->ok([
            'referenceCode' => $refCode,
            'createdAt' => $enquiry->created_at?->toIso8601String(),
        ], 'Admission enquiry submitted successfully.', status: 201);
    }

    public function submitFeedback(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'role' => ['required', 'string', 'max:80'],
            'email' => ['nullable', 'email', 'max:191'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comments' => ['required', 'string', 'min:5', 'max:2000'],
        ]);

        $form = FormDefinition::firstOrCreate(
            ['slug' => 'institutional-feedback'],
            ['name' => 'Institutional Feedback Form', 'active' => true]
        );

        FormSubmission::create([
            'form_id' => $form->id,
            'payload_json' => $validated,
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        NotificationItem::create([
            'title' => 'New Campus Feedback Submitted',
            'message' => "{$validated['name']} ({$validated['role']}) submitted feedback.",
            'type' => 'system',
            'is_read' => false,
            'link' => '/notifications',
        ]);

        return $this->ok(null, 'Thank you for submitting your institutional feedback.', status: 201);
    }

    public function sitemap(): Response
    {
        $seo = SeoSetting::first();
        if ($seo && !$seo->enable_sitemap) {
            return response('', 404);
        }

        $baseUrl = rtrim(config('app.url', 'https://kitspharmacy.ac.in'), '/');
        $staticRoutes = [
            '/', '/about', '/about/history', '/about/vision-mission', '/about/principal-message', '/about/governance',
            '/academics', '/academics/programs', '/academics/calendar', '/academics/syllabus', '/academics/examination-cell',
            '/admissions', '/admissions/eligibility', '/admissions/process',
            '/departments', '/faculty', '/campus-life', '/achievements', '/placements', '/gallery', '/news', '/events',
            '/downloads', '/contact', '/feedback',
        ];

        $urls = collect($staticRoutes)->map(fn ($r) => $baseUrl.$r);

        Department::where('active', true)->pluck('slug')->each(function ($slug) use (&$urls, $baseUrl) {
            $urls->push("{$baseUrl}/departments/{$slug}");
        });

        Page::where('status', 'published')->where('enabled', true)->where('is_system_route', false)->pluck('slug')->each(function ($slug) use (&$urls, $baseUrl) {
            $urls->push("{$baseUrl}/p/{$slug}");
        });

        $xml = view('sitemap', ['urls' => $urls->unique()->values()])->render();

        return response($xml, 200)->header('Content-Type', 'application/xml; charset=UTF-8');
    }

    public function robots(): Response
    {
        $install = InstallationStatus::first();
        $loginPath = $install?->admin_login_path ?? '/admin-login';
        $panelPath = $install?->admin_panel_path ?? '/control-panel';
        $baseUrl = rtrim(config('app.url', 'https://kitspharmacy.ac.in'), '/');

        $lines = [
            'User-agent: *',
            'Allow: /',
            "Disallow: {$loginPath}",
            "Disallow: {$panelPath}/",
            'Disallow: /admin',
            'Disallow: /install',
            'Disallow: /api/',
            'Disallow: /sanctum/',
            '',
            "Sitemap: {$baseUrl}/sitemap.xml",
        ];

        return response(implode("\n", $lines)."\n", 200)->header('Content-Type', 'text/plain; charset=UTF-8');
    }
}
