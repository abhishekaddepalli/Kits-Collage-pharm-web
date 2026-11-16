<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AcademicDocument;
use App\Models\Achievement;
use App\Models\ActivityLog;
use App\Models\AdmissionCampaign;
use App\Models\AdmissionEnquiry;
use App\Models\CampusFacility;
use App\Models\Department;
use App\Models\EnquiryAssignment;
use App\Models\EnquiryNote;
use App\Models\EventItem;
use App\Models\Faculty;
use App\Models\GalleryItem;
use App\Models\NewsItem;
use App\Models\Placement;
use App\Models\Program;
use App\Models\Testimonial;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminAcademicsAndAdmissionsController extends Controller
{
    use ApiResponse;

    public function syncPrograms(Request $request): JsonResponse
    {
        $data = $request->validate(['programs' => ['required', 'array']]);
        DB::transaction(function () use ($data) {
            Program::query()->delete();
            foreach ($data['programs'] as $idx => $p) {
                Program::create([
                    'name' => $p['name'] ?? 'Program',
                    'code' => $p['code'] ?? 'PHARM',
                    'level' => $p['level'] ?? 'UG',
                    'qualification' => $p['qualification'] ?? '',
                    'duration' => $p['duration'] ?? '4 Years',
                    'eligibility' => $p['eligibility'] ?? '',
                    'description' => $p['description'] ?? '',
                    'intake_capacity' => $p['intakeCapacity'] ?? '',
                    'admission_info' => $p['admissionInfo'] ?? '',
                    'brochure_url' => $p['brochureUrl'] ?? '',
                    'verification_status' => $p['verificationStatus'] ?? 'verified',
                    'active' => (bool) ($p['active'] ?? true),
                    'sort_order' => $idx + 1,
                ]);
            }
        });
        $this->log($request, 'Updated academic programs', 'Programs');
        return $this->ok(null, 'Programs saved.');
    }

    public function syncDepartments(Request $request): JsonResponse
    {
        $data = $request->validate(['departments' => ['required', 'array']]);
        DB::transaction(function () use ($data) {
            foreach ($data['departments'] as $idx => $d) {
                Department::updateOrCreate(
                    ['slug' => $d['slug'] ?? Str::slug($d['name'] ?? 'dept-'.$idx)],
                    [
                        'name' => $d['name'] ?? 'Department',
                        'short_description' => $d['shortDescription'] ?? '',
                        'introduction' => $d['introduction'] ?? '',
                        'icon_name' => $d['iconName'] ?? 'FlaskConical',
                        'image_url' => $d['imageUrl'] ?? '',
                        'image_alt' => $d['imageAlt'] ?? '',
                        'facilities_json' => $d['facilities'] ?? [],
                        'laboratories_json' => $d['laboratories'] ?? [],
                        'research_areas_json' => $d['researchAreas'] ?? [],
                        'publications_json' => $d['publications'] ?? [],
                        'verification_status' => $d['verificationStatus'] ?? 'verified',
                        'active' => (bool) ($d['active'] ?? true),
                        'sort_order' => $idx + 1,
                    ]
                );
            }
        });
        $this->log($request, 'Updated academic departments', 'Departments');
        return $this->ok(null, 'Departments saved.');
    }

    public function syncFaculty(Request $request): JsonResponse
    {
        $data = $request->validate(['faculty' => ['required', 'array']]);
        DB::transaction(function () use ($data) {
            Faculty::query()->delete();
            foreach ($data['faculty'] as $idx => $f) {
                $fac = Faculty::create([
                    'name' => $f['name'] ?? 'Faculty Member',
                    'photo_url' => $f['photoUrl'] ?? '',
                    'photo_alt' => $f['photoAlt'] ?? '',
                    'designation' => $f['designation'] ?? 'Assistant Professor',
                    'qualification' => $f['qualification'] ?? 'M.Pharm.',
                    'experience' => $f['experience'] ?? '',
                    'biography' => $f['biography'] ?? '',
                    'email' => $f['email'] ?? '',
                    'research_interests_json' => $f['researchInterests'] ?? [],
                    'publications_count' => (int) ($f['publicationsCount'] ?? 0),
                    'sort_order' => (int) ($f['order'] ?? ($idx + 1)),
                    'active' => (bool) ($f['active'] ?? true),
                    'verification_status' => $f['verificationStatus'] ?? 'verified',
                ]);
                if (!empty($f['departmentId']) && is_numeric($f['departmentId'])) {
                    $fac->departments()->sync([(int) $f['departmentId']]);
                }
            }
        });
        $this->log($request, 'Updated faculty directory', 'Faculty');
        return $this->ok(null, 'Faculty directory saved.');
    }

    public function updateAdmissionsSettings(Request $request): JsonResponse
    {
        $data = $request->validate([
            'academicYear' => ['required', 'string', 'max:40'],
            'admissionsOpen' => ['required', 'boolean'],
            'headline' => ['required', 'string', 'max:255'],
            'subtext' => ['nullable', 'string', 'max:1000'],
            'importantDates' => ['nullable', 'array'],
            'scholarshipNote' => ['nullable', 'string'],
            'feeNote' => ['nullable', 'string'],
            'processSteps' => ['nullable', 'array'],
        ]);

        AdmissionCampaign::updateOrCreate(['id' => 1], [
            'academic_year' => $data['academicYear'],
            'admissions_open' => $data['admissionsOpen'],
            'headline' => $data['headline'],
            'subtext' => $data['subtext'] ?? '',
            'important_dates_json' => $data['importantDates'] ?? [],
            'scholarship_note' => $data['scholarshipNote'] ?? '',
            'fee_note' => $data['feeNote'] ?? '',
            'process_steps_json' => $data['processSteps'] ?? [],
        ]);

        $this->log($request, 'Updated admissions campaign settings', 'Admissions');
        return $this->ok(null, 'Admissions settings saved.');
    }

    public function listEnquiries(Request $request): JsonResponse
    {
        $status = $request->query('status');
        $search = trim((string) $request->query('search', ''));

        $enquiries = AdmissionEnquiry::with(['notesHistory', 'latestAssignment.assignee'])
            ->when($status && $status !== 'All', fn ($q) => $q->where('status', $status))
            ->when($search !== '', fn ($q) => $q->where(fn ($sub) => $sub
                ->where('student_name', 'like', "%{$search}%")
                ->orWhere('mobile', 'like', "%{$search}%")
                ->orWhere('reference_code', 'like', "%{$search}%")))
            ->latest()
            ->paginate(25);

        return $this->ok($enquiries);
    }

    public function updateEnquiry(Request $request, string $id): JsonResponse
    {
        $enquiry = is_numeric($id)
            ? AdmissionEnquiry::findOrFail((int) $id)
            : AdmissionEnquiry::where('reference_code', $id)->firstOrFail();

        $data = $request->validate([
            'status' => ['sometimes', 'in:New,Contacted,Interested,Follow-up,Converted,Not Interested'],
            'followUpDate' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'assignedUserId' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        if (isset($data['status']) || array_key_exists('followUpDate', $data)) {
            $enquiry->update([
                'status' => $data['status'] ?? $enquiry->status,
                'follow_up_date' => $data['followUpDate'] ?? $enquiry->follow_up_date,
            ]);
        }

        if (!empty($data['notes'])) {
            EnquiryNote::create([
                'enquiry_id' => $enquiry->id,
                'user_id' => $request->user()?->id,
                'note' => $data['notes'],
            ]);
        }

        if (!empty($data['assignedUserId'])) {
            EnquiryAssignment::create([
                'enquiry_id' => $enquiry->id,
                'assigned_to_user_id' => $data['assignedUserId'],
                'assigned_by_user_id' => $request->user()?->id,
                'assigned_at' => now(),
            ]);
        }

        $this->log($request, "Updated enquiry {$enquiry->reference_code}", 'Enquiries');
        return $this->ok(null, 'Enquiry updated.');
    }

    public function exportEnquiries(): StreamedResponse
    {
        return response()->streamDownload(function () {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Reference', 'Student Name', 'Parent Name', 'Mobile', 'Email', 'Program', 'Qualification', 'City', 'State', 'Status', 'Follow-Up Date', 'Submitted At']);
            AdmissionEnquiry::latest()->chunk(200, function ($rows) use ($handle) {
                foreach ($rows as $row) {
                    fputcsv($handle, [
                        $row->reference_code, $row->student_name, $row->parent_name, $row->mobile,
                        $row->email, $row->interested_program, $row->qualification, $row->city,
                        $row->state, $row->status, $row->follow_up_date?->format('Y-m-d'),
                        $row->created_at?->toIso8601String(),
                    ]);
                }
            });
            fclose($handle);
        }, 'kits-admission-enquiries-'.date('Y-m-d').'.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function syncNewsEvents(Request $request): JsonResponse
    {
        $data = $request->validate(['newsEvents' => ['required', 'array']]);
        DB::transaction(function () use ($data) {
            NewsItem::query()->delete();
            EventItem::query()->delete();
            foreach ($data['newsEvents'] as $idx => $item) {
                $slug = Str::slug($item['slug'] ?? $item['title'] ?? 'item-'.$idx);
                if (($item['type'] ?? 'news') === 'event') {
                    EventItem::create([
                        'title' => $item['title'] ?? 'Campus Event',
                        'slug' => $slug.'-'.$idx,
                        'excerpt' => $item['excerpt'] ?? '',
                        'content' => $item['content'] ?? '',
                        'featured_image' => $item['featuredImage'] ?? '',
                        'image_alt' => $item['imageAlt'] ?? '',
                        'event_date' => !empty($item['eventDate']) ? $item['eventDate'] : date('Y-m-d'),
                        'venue' => $item['venue'] ?? 'KITS Divili Campus',
                        'author' => $item['author'] ?? 'Academic Cell',
                        'status' => $item['status'] ?? 'published',
                        'published_at' => !empty($item['publishedAt']) ? $item['publishedAt'] : date('Y-m-d'),
                        'seo_title' => $item['seoTitle'] ?? '',
                        'seo_description' => $item['seoDescription'] ?? '',
                    ]);
                } else {
                    NewsItem::create([
                        'type' => ($item['type'] ?? 'news') === 'announcement' ? 'announcement' : 'news',
                        'title' => $item['title'] ?? 'Campus News',
                        'slug' => $slug.'-'.$idx,
                        'excerpt' => $item['excerpt'] ?? '',
                        'content' => $item['content'] ?? '',
                        'featured_image' => $item['featuredImage'] ?? '',
                        'image_alt' => $item['imageAlt'] ?? '',
                        'author' => $item['author'] ?? 'Administration',
                        'status' => $item['status'] ?? 'published',
                        'published_at' => !empty($item['publishedAt']) ? $item['publishedAt'] : date('Y-m-d'),
                        'seo_title' => $item['seoTitle'] ?? '',
                        'seo_description' => $item['seoDescription'] ?? '',
                    ]);
                }
            }
        });
        $this->log($request, 'Updated news and events items', 'News & Events');
        return $this->ok(null, 'News and events saved.');
    }

    public function syncContentModule(Request $request, string $module): JsonResponse
    {
        $items = $request->input('items', []);
        DB::transaction(function () use ($module, $items) {
            match ($module) {
                'achievements' => $this->replaceAchievements($items),
                'placements' => $this->replacePlacements($items),
                'campus-life' => $this->replaceCampusLife($items),
                'gallery' => $this->replaceGallery($items),
                'testimonials' => $this->replaceTestimonials($items),
                'downloads' => $this->replaceDownloads($items),
                default => abort(404, 'Unknown content module.'),
            };
        });
        $this->log($request, "Updated {$module} items", ucfirst($module));
        return $this->ok(null, ucfirst($module).' updated.');
    }

    protected function replaceAchievements(array $items): void
    {
        Achievement::query()->delete();
        foreach ($items as $it) {
            Achievement::create([
                'category' => $it['category'] ?? 'Institutional',
                'title' => $it['title'] ?? '',
                'recipient' => $it['recipient'] ?? '',
                'year' => $it['year'] ?? date('Y'),
                'description' => $it['description'] ?? '',
                'image_url' => $it['imageUrl'] ?? '',
                'verification_status' => $it['verificationStatus'] ?? 'verified',
                'active' => (bool) ($it['active'] ?? true),
            ]);
        }
    }

    protected function replacePlacements(array $items): void
    {
        Placement::query()->delete();
        foreach ($items as $it) {
            Placement::create([
                'company_name' => $it['companyName'] ?? '',
                'sector' => $it['sector'] ?? '',
                'role_title' => $it['roleTitle'] ?? '',
                'year' => $it['year'] ?? date('Y'),
                'notes' => $it['notes'] ?? '',
                'verification_status' => $it['verificationStatus'] ?? 'verified',
                'active' => (bool) ($it['active'] ?? true),
            ]);
        }
    }

    protected function replaceCampusLife(array $items): void
    {
        CampusFacility::query()->delete();
        foreach ($items as $idx => $it) {
            CampusFacility::create([
                'slug' => $it['slug'] ?? Str::slug($it['title'] ?? 'facility-'.$idx),
                'title' => $it['title'] ?? '',
                'category' => $it['category'] ?? 'Campus Infrastructure',
                'summary' => $it['summary'] ?? '',
                'details' => $it['details'] ?? '',
                'highlights_json' => $it['highlights'] ?? [],
                'image_url' => $it['imageUrl'] ?? '',
                'image_alt' => $it['imageAlt'] ?? '',
                'active' => (bool) ($it['active'] ?? true),
                'sort_order' => $idx + 1,
            ]);
        }
    }

    protected function replaceGallery(array $items): void
    {
        GalleryItem::query()->delete();
        foreach ($items as $it) {
            GalleryItem::create([
                'category_name' => $it['category'] ?? 'Campus',
                'title' => $it['title'] ?? '',
                'media_type' => $it['mediaType'] ?? 'photo',
                'url' => $it['url'] ?? '',
                'youtube_id' => $it['youtubeId'] ?? null,
                'alt_text' => $it['altText'] ?? '',
                'captured_date' => !empty($it['date']) ? $it['date'] : date('Y-m-d'),
                'active' => (bool) ($it['active'] ?? true),
            ]);
        }
    }

    protected function replaceTestimonials(array $items): void
    {
        Testimonial::query()->delete();
        foreach ($items as $it) {
            Testimonial::create([
                'student_name' => $it['studentName'] ?? '',
                'photo_url' => $it['photoUrl'] ?? '',
                'course' => $it['course'] ?? 'B.Pharmacy',
                'graduation_year' => $it['graduationYear'] ?? date('Y'),
                'quote' => $it['quote'] ?? '',
                'verification_status' => $it['verificationStatus'] ?? 'verified',
                'active' => (bool) ($it['active'] ?? true),
            ]);
        }
    }

    protected function replaceDownloads(array $items): void
    {
        AcademicDocument::query()->delete();
        foreach ($items as $it) {
            AcademicDocument::create([
                'title' => $it['title'] ?? '',
                'category' => $it['category'] ?? 'Syllabus',
                'file_url' => $it['fileUrl'] ?? '',
                'file_size' => $it['fileSize'] ?? '',
                'published_date' => !empty($it['updatedAt']) ? $it['updatedAt'] : date('Y-m-d'),
                'active' => (bool) ($it['active'] ?? true),
            ]);
        }
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
