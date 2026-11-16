<?php

namespace App\Services;

use App\Http\Middleware\EnsureInstalled;
use App\Models\AcademicDocument;
use App\Models\Achievement;
use App\Models\ActivityLog;
use App\Models\AdmissionCampaign;
use App\Models\AdmissionEnquiry;
use App\Models\Banner;
use App\Models\CampusFacility;
use App\Models\ChatbotConversation;
use App\Models\ChatbotFaq;
use App\Models\ChatbotSetting;
use App\Models\Department;
use App\Models\EventItem;
use App\Models\Faculty;
use App\Models\FooterSetting;
use App\Models\FormDefinition;
use App\Models\GalleryItem;
use App\Models\HeaderSetting;
use App\Models\InstallationStatus;
use App\Models\Media;
use App\Models\Menu;
use App\Models\NewsItem;
use App\Models\NotificationItem;
use App\Models\Page;
use App\Models\Placement;
use App\Models\Program;
use App\Models\Role;
use App\Models\SeoSetting;
use App\Models\SiteSetting;
use App\Models\Slider;
use App\Models\SocialLink;
use App\Models\Testimonial;
use App\Models\Theme;
use App\Models\ThemeSetting;
use App\Models\User;

class BootstrapStateService
{
    public function publicBootstrap(): array
    {
        $installRow = InstallationStatus::first();
        $activeTheme = Theme::where('is_active', true)->first() ?? Theme::first();
        $themeSetting = $activeTheme ? ThemeSetting::where('theme_id', $activeTheme->id)->first() : null;
        $header = HeaderSetting::first();
        $footer = FooterSetting::first();
        $socialLinks = SocialLink::pluck('url', 'platform')->all();
        $primaryMenu = Menu::where('slug', 'primary-nav')->with('items.children')->first();
        $slider = Slider::where('slug', 'home-hero')->with('items')->first();
        $seo = SeoSetting::first();
        $chatbotSetting = ChatbotSetting::first();
        $campaign = AdmissionCampaign::first();

        $siteSettings = SiteSetting::all()->groupBy('group')->map(
            fn ($items) => $items->pluck('value', 'key')->all()
        )->all();

        $pages = Page::where('status', 'published')->where('enabled', true)->with('sections')->get();

        return [
            'installed' => EnsureInstalled::isInstalled(),
            'runtimeConfig' => [
                'adminLoginPath' => $installRow?->admin_login_path ?? config('app.admin_login_path', '/admin-login'),
                'adminPanelPath' => $installRow?->admin_panel_path ?? config('app.admin_panel_path', '/control-panel'),
            ],
            'appearance' => [
                'activeThemeId' => $activeTheme?->slug ?? 'royal-purple-gold',
                'palette' => $activeTheme?->palette_json ?? [],
                'customThemes' => Theme::where('is_preset', false)->get()->map(fn ($t) => $t->palette_json)->all(),
                'presets' => Theme::where('is_preset', true)->get()->map(fn ($t) => $t->palette_json)->all(),
                'typography' => $themeSetting?->typography_json ?? [
                    'headingFont' => 'Playfair Display',
                    'bodyFont' => 'Plus Jakarta Sans',
                    'baseFontSize' => 16,
                    'headingWeight' => 700,
                    'lineHeight' => 1.65,
                    'headingTracking' => '-0.02em',
                ],
                'layout' => $themeSetting?->layout_json ?? [
                    'contentWidth' => '1280px',
                    'headerHeight' => 76,
                    'footerStyle' => 'multi-column',
                    'sectionSpacing' => 64,
                    'cardRadius' => 16,
                    'buttonRadius' => 9999,
                    'shadowIntensity' => 'subtle',
                    'stickyHeader' => true,
                ],
            ],
            'header' => $header ? [
                'collegeName' => $header->college_name,
                'collegeSubtitle' => $header->college_subtitle,
                'locationShort' => $header->location_short,
                'affiliationText' => $header->affiliation_text,
                'approvalText' => $header->approval_text,
                'phone' => $header->phone,
                'secondaryPhone' => $header->secondary_phone,
                'email' => $header->email,
                'workingHours' => $header->working_hours,
                'announcementText' => $header->announcement_text,
                'announcementLink' => $header->announcement_link,
                'showAnnouncement' => $header->show_announcement,
                'examPortalLabel' => $header->exam_portal_label,
                'examPortalUrl' => $header->exam_portal_url,
                'studentPortalLabel' => $header->student_portal_label,
                'studentPortalUrl' => $header->student_portal_url,
                'staffPortalLabel' => '',
                'staffPortalUrl' => '',
                'defaultLanguage' => $header->default_language,
                'applyButtonLabel' => $header->apply_button_label,
                'applyButtonPath' => $header->apply_button_path,
                'logoUrl' => $header->logo_url,
                'headerBg' => $header->header_bg,
                'headerTextColor' => $header->header_text_color,
                'navBg' => $header->nav_bg,
                'navTextColor' => $header->nav_text_color,
                'sticky' => $header->sticky,
            ] : null,
            'navigation' => $primaryMenu ? $primaryMenu->items->map(fn ($item) => [
                'id' => (string) $item->id,
                'label' => $item->label,
                'path' => $item->path,
                'order' => $item->sort_order,
                'enabled' => $item->enabled,
                'openInNewTab' => $item->open_in_new_tab,
                'children' => $item->children->map(fn ($child) => [
                    'id' => (string) $child->id,
                    'label' => $child->label,
                    'path' => $child->path,
                    'order' => $child->sort_order,
                    'enabled' => $child->enabled,
                    'openInNewTab' => $child->open_in_new_tab,
                ])->all(),
            ])->all() : [],
            'footer' => $footer ? [
                'logoUrl' => $footer->logo_url,
                'introText' => $footer->intro_text,
                'columns' => $footer->columns_json ?? [],
                'address' => $footer->address,
                'phone' => $footer->phone,
                'email' => $footer->email,
                'copyrightText' => $footer->copyright_text,
                'backgroundColor' => $footer->background_color,
                'textColor' => $footer->text_color,
                'socialLinks' => [
                    'facebook' => $socialLinks['facebook'] ?? '',
                    'instagram' => $socialLinks['instagram'] ?? '',
                    'youtube' => $socialLinks['youtube'] ?? '',
                    'linkedin' => $socialLinks['linkedin'] ?? '',
                    'x' => $socialLinks['x'] ?? '',
                ],
                'customBlockTitle' => $footer->custom_block_title,
                'customBlockContent' => $footer->custom_block_content,
            ] : null,
            'sliders' => $slider ? $slider->items->map(fn ($s) => [
                'id' => (string) $s->id,
                'badge' => $s->badge,
                'heading' => $s->heading,
                'highlightedText' => $s->highlighted_text,
                'subheading' => $s->subheading,
                'description' => $s->description,
                'desktopImage' => $s->desktop_image,
                'mobileImage' => $s->mobile_image,
                'imageAlt' => $s->image_alt,
                'primaryCtaLabel' => $s->primary_cta_label,
                'primaryCtaLink' => $s->primary_cta_link,
                'secondaryCtaLabel' => $s->secondary_cta_label,
                'secondaryCtaLink' => $s->secondary_cta_link,
                'overlayOpacity' => $s->overlay_opacity,
                'textPosition' => $s->text_position,
                'animation' => $s->animation,
                'durationMs' => $s->duration_ms,
                'order' => $s->sort_order,
                'active' => $s->active,
                'startDate' => $s->start_date?->format('Y-m-d'),
                'endDate' => $s->end_date?->format('Y-m-d'),
                'videoUrl' => $s->video_url,
            ])->all() : [],
            'banners' => Banner::where('active', true)->get()->map(fn ($b) => [
                'id' => (string) $b->id,
                'title' => $b->title,
                'subtitle' => $b->subtitle,
                'ctaLabel' => $b->cta_label,
                'ctaLink' => $b->cta_link,
                'imageUrl' => $b->image_url,
                'active' => $b->active,
                'placement' => $b->placement,
            ])->all(),
            'pages' => $pages->map(fn ($p) => $this->serializePage($p))->all(),
            'programs' => Program::where('active', true)->orderBy('sort_order')->get()->map(fn ($p) => [
                'id' => (string) $p->id,
                'name' => $p->name,
                'code' => $p->code,
                'level' => $p->level,
                'qualification' => $p->qualification,
                'duration' => $p->duration,
                'eligibility' => $p->eligibility,
                'description' => $p->description,
                'intakeCapacity' => $p->intake_capacity,
                'admissionInfo' => $p->admission_info,
                'brochureUrl' => $p->brochure_url,
                'verificationStatus' => $p->verification_status,
                'active' => $p->active,
            ])->all(),
            'departments' => Department::where('active', true)->orderBy('sort_order')->get()->map(fn ($d) => [
                'id' => (string) $d->id,
                'slug' => $d->slug,
                'name' => $d->name,
                'shortDescription' => $d->short_description,
                'introduction' => $d->introduction,
                'iconName' => $d->icon_name,
                'imageUrl' => $d->image_url,
                'imageAlt' => $d->image_alt,
                'facilities' => $d->facilities_json ?? [],
                'laboratories' => $d->laboratories_json ?? [],
                'researchAreas' => $d->research_areas_json ?? [],
                'publications' => $d->publications_json ?? [],
                'active' => $d->active,
                'verificationStatus' => $d->verification_status,
            ])->all(),
            'faculty' => Faculty::where('active', true)->with('departments')->orderBy('sort_order')->get()->map(fn ($f) => [
                'id' => (string) $f->id,
                'name' => $f->name,
                'photoUrl' => $f->photo_url,
                'photoAlt' => $f->photo_alt,
                'designation' => $f->designation,
                'departmentId' => (string) ($f->departments->first()?->id ?? ''),
                'departmentName' => $f->departments->first()?->name ?? '',
                'qualification' => $f->qualification,
                'experience' => $f->experience,
                'biography' => $f->biography,
                'email' => $f->email,
                'researchInterests' => $f->research_interests_json ?? [],
                'publicationsCount' => $f->publications_count,
                'order' => $f->sort_order,
                'active' => $f->active,
                'verificationStatus' => $f->verification_status,
            ])->all(),
            'newsEvents' => $this->serializeNewsEvents(true),
            'achievements' => Achievement::where('active', true)->get()->map(fn ($a) => [
                'id' => (string) $a->id,
                'category' => $a->category,
                'title' => $a->title,
                'recipient' => $a->recipient,
                'year' => $a->year,
                'description' => $a->description,
                'imageUrl' => $a->image_url,
                'verificationStatus' => $a->verification_status,
                'active' => $a->active,
            ])->all(),
            'placements' => Placement::where('active', true)->get()->map(fn ($p) => [
                'id' => (string) $p->id,
                'companyName' => $p->company_name,
                'sector' => $p->sector,
                'roleTitle' => $p->role_title,
                'year' => $p->year,
                'notes' => $p->notes,
                'verificationStatus' => $p->verification_status,
                'active' => $p->active,
            ])->all(),
            'campusLife' => CampusFacility::where('active', true)->orderBy('sort_order')->get()->map(fn ($c) => [
                'id' => (string) $c->id,
                'slug' => $c->slug,
                'title' => $c->title,
                'category' => $c->category,
                'summary' => $c->summary,
                'details' => $c->details,
                'highlights' => $c->highlights_json ?? [],
                'imageUrl' => $c->image_url,
                'imageAlt' => $c->image_alt,
                'active' => $c->active,
            ])->all(),
            'gallery' => GalleryItem::where('active', true)->get()->map(fn ($g) => [
                'id' => (string) $g->id,
                'title' => $g->title,
                'category' => $g->category_name,
                'mediaType' => $g->media_type,
                'url' => $g->url,
                'youtubeId' => $g->youtube_id,
                'altText' => $g->alt_text,
                'date' => $g->captured_date?->format('Y-m-d') ?? '',
                'active' => $g->active,
            ])->all(),
            'testimonials' => Testimonial::where('active', true)->get()->map(fn ($t) => [
                'id' => (string) $t->id,
                'studentName' => $t->student_name,
                'photoUrl' => $t->photo_url,
                'course' => $t->course,
                'graduationYear' => $t->graduation_year,
                'quote' => $t->quote,
                'active' => $t->active,
                'verificationStatus' => $t->verification_status,
            ])->all(),
            'downloads' => AcademicDocument::where('active', true)->get()->map(fn ($d) => [
                'id' => (string) $d->id,
                'title' => $d->title,
                'category' => $d->category,
                'fileUrl' => $d->file_url,
                'fileSize' => $d->file_size,
                'updatedAt' => $d->published_date?->format('Y-m-d') ?? '',
                'active' => $d->active,
            ])->all(),
            'chatbot' => [
                'enabled' => $chatbotSetting?->enabled ?? true,
                'name' => $chatbotSetting?->name ?? 'KITS AI Assistant',
                'avatarUrl' => $chatbotSetting?->avatar_url ?? '',
                'welcomeMessage' => $chatbotSetting?->welcome_message ?? '',
                'primaryColor' => $chatbotSetting?->primary_color ?? '#52128B',
                'suggestedQuestions' => $chatbotSetting?->suggested_questions_json ?? [],
                'fallbackMessage' => $chatbotSetting?->fallback_message ?? '',
                'providerMode' => $chatbotSetting?->ai_enabled ? 'backend_ai_adapter' : 'local_faq',
                'faqs' => ChatbotFaq::where('enabled', true)->with('keywords')->orderBy('sort_order')->get()->map(fn ($faq) => [
                    'id' => (string) $faq->id,
                    'category' => $faq->category_name,
                    'question' => $faq->question,
                    'answer' => $faq->answer,
                    'keywords' => $faq->keywords->pluck('keyword')->all(),
                    'enabled' => $faq->enabled,
                ])->all(),
                'conversations' => [],
            ],
            'seo' => $seo ? [
                'siteTitle' => $seo->site_title,
                'siteDescription' => $seo->site_description,
                'defaultKeywords' => $seo->default_keywords,
                'faviconUrl' => $seo->favicon_url,
                'defaultOgImage' => $seo->default_og_image,
                'robotsIndex' => $seo->robots_index,
                'enableSitemap' => $seo->enable_sitemap,
                'enableBreadcrumbs' => $seo->enable_breadcrumbs,
                'enableStructuredData' => $seo->enable_structured_data,
                'institutionType' => $seo->institution_type,
            ] : null,
            'forms' => FormDefinition::where('active', true)->get()->map(fn ($f) => [
                'id' => (string) $f->id,
                'name' => $f->name,
                'slug' => $f->slug,
                'description' => $f->description,
                'recipientEmail' => $f->recipient_email,
                'submitLabel' => $f->submit_label,
                'successMessage' => $f->success_message,
                'fields' => $f->fields_json ?? [],
                'active' => $f->active,
            ])->all(),
            'settings' => [
                'general' => $siteSettings['general'] ?? [],
                'branding' => $siteSettings['branding'] ?? [],
                'contact' => $siteSettings['contact'] ?? [],
                'social' => $socialLinks,
                'integrations' => $siteSettings['integrations'] ?? [],
                'maintenance' => [
                    'enabled' => ($siteSettings['maintenance']['enabled'] ?? '0') === '1',
                    'mode' => $siteSettings['maintenance']['mode'] ?? 'maintenance',
                    'message' => $siteSettings['maintenance']['message'] ?? '',
                ],
                'admissionsConfig' => $campaign ? [
                    'academicYear' => $campaign->academic_year,
                    'admissionsOpen' => $campaign->admissions_open,
                    'headline' => $campaign->headline,
                    'subtext' => $campaign->subtext,
                    'importantDates' => $campaign->important_dates_json ?? [],
                    'scholarshipNote' => $campaign->scholarship_note,
                    'feeNote' => $campaign->fee_note,
                    'processSteps' => $campaign->process_steps_json ?? [],
                ] : null,
            ],
        ];
    }

    public function adminBootstrap(): array
    {
        $public = $this->publicBootstrap();

        // Include ALL pages (including drafts/scheduled), ALL media, enquiries, chatbot logs, users, roles, notifications, activity logs
        $public['pages'] = Page::with('sections')->get()->map(fn ($p) => $this->serializePage($p))->all();
        $public['newsEvents'] = $this->serializeNewsEvents(false);
        $public['media'] = Media::latest()->get()->map(fn ($m) => [
            'id' => (string) $m->id,
            'title' => $m->title,
            'altText' => $m->alt_text ?? '',
            'type' => $m->type,
            'folder' => $m->folder_name,
            'url' => $m->public_url,
            'fileSize' => $m->file_size_label,
            'dimensions' => $m->dimensions,
            'uploadedAt' => $m->created_at?->format('Y-m-d') ?? '',
        ])->all();
        $public['enquiries'] = AdmissionEnquiry::with(['notesHistory', 'latestAssignment.assignee'])
            ->latest()
            ->get()
            ->map(fn ($e) => [
                'id' => $e->reference_code,
                'dbId' => $e->id,
                'studentName' => $e->student_name,
                'parentName' => $e->parent_name ?? '',
                'mobile' => $e->mobile,
                'email' => $e->email ?? '',
                'interestedProgram' => $e->interested_program,
                'qualification' => $e->qualification ?? '',
                'city' => $e->city ?? '',
                'state' => $e->state ?? '',
                'message' => $e->message ?? '',
                'status' => $e->status,
                'assignedTo' => $e->latestAssignment?->assignee?->name ?? 'Unassigned',
                'notes' => $e->notesHistory->first()?->note ?? '',
                'followUpDate' => $e->follow_up_date?->format('Y-m-d') ?? '',
                'createdAt' => $e->created_at?->toIso8601String() ?? '',
            ])->all();

        $public['chatbot']['faqs'] = ChatbotFaq::with('keywords')->orderBy('sort_order')->get()->map(fn ($faq) => [
            'id' => (string) $faq->id,
            'category' => $faq->category_name,
            'question' => $faq->question,
            'answer' => $faq->answer,
            'keywords' => $faq->keywords->pluck('keyword')->all(),
            'enabled' => $faq->enabled,
        ])->all();

        $public['chatbot']['conversations'] = ChatbotConversation::with('messages')
            ->latest('last_message_at')
            ->limit(100)
            ->get()
            ->flatMap(function ($conv) {
                $pairs = [];
                $lastUser = null;
                foreach ($conv->messages as $msg) {
                    if ($msg->sender === 'user') {
                        $lastUser = $msg;
                    } elseif ($msg->sender === 'bot' && $lastUser) {
                        $pairs[] = [
                            'id' => 'msg-'.$msg->id,
                            'userQuery' => $lastUser->message_text,
                            'matchedFaqId' => $msg->matched_faq_id ? (string) $msg->matched_faq_id : null,
                            'botResponse' => $msg->message_text,
                            'timestamp' => $msg->created_at?->toIso8601String() ?? '',
                            'matched' => $msg->matched,
                        ];
                        $lastUser = null;
                    }
                }
                return $pairs;
            })->all();

        $public['users'] = User::with('roles')->get()->map(fn ($u) => [
            'id' => (string) $u->id,
            'name' => $u->name,
            'username' => $u->username,
            'email' => $u->email,
            'role' => $u->primaryRoleName(),
            'active' => $u->is_active,
            'lastLogin' => $u->last_login_at?->toIso8601String() ?? 'Never',
        ])->all();

        $public['roles'] = Role::with('permissions')->get()->map(fn ($r) => [
            'id' => (string) $r->id,
            'name' => $r->name,
            'description' => $r->description ?? '',
            'permissions' => $r->permissions->pluck('key')->all(),
        ])->all();

        $public['notifications'] = NotificationItem::latest()->limit(50)->get()->map(fn ($n) => [
            'id' => (string) $n->id,
            'title' => $n->title,
            'message' => $n->message,
            'type' => $n->type,
            'read' => $n->is_read,
            'createdAt' => $n->created_at?->toIso8601String() ?? '',
            'link' => $n->link,
        ])->all();

        $public['activityLogs'] = ActivityLog::latest('created_at')->limit(100)->get()->map(fn ($a) => [
            'id' => (string) $a->id,
            'actor' => $a->actor_name,
            'role' => $a->actor_role,
            'action' => $a->action,
            'module' => $a->module,
            'timestamp' => $a->created_at?->toIso8601String() ?? '',
        ])->all();

        $installRow = InstallationStatus::first();
        $public['installInfo'] = [
            'isInstalledDemo' => EnsureInstalled::isInstalled(),
            'installedAt' => $installRow?->installed_at?->toIso8601String(),
            'databaseType' => 'MySQL 8.0+',
            'databaseHost' => config('database.connections.mysql.host', '127.0.0.1'),
            'databaseName' => config('database.connections.mysql.database', 'kits_pharmacy_cms'),
            'appVersion' => $installRow?->app_version ?? '2.0.0',
            'environmentMode' => 'backend_ready',
        ];

        return $public;
    }

    public function serializePage(Page $p): array
    {
        return [
            'id' => (string) $p->id,
            'title' => $p->title,
            'slug' => $p->slug,
            'status' => $p->status,
            'scheduledAt' => $p->scheduled_at?->toIso8601String(),
            'enabled' => $p->enabled,
            'seoTitle' => $p->seo_title ?? $p->title,
            'seoDescription' => $p->seo_description ?? '',
            'updatedAt' => $p->updated_at?->format('Y-m-d') ?? '',
            'isSystemRoute' => $p->is_system_route,
            'sections' => $p->sections->map(fn ($s) => [
                'id' => (string) $s->id,
                'type' => $s->type,
                'title' => $s->title ?? '',
                'subtitle' => $s->subtitle,
                'body' => $s->body,
                'imageUrl' => $s->image_url,
                'imageAlt' => $s->image_alt,
                'background' => $s->background,
                'paddingY' => $s->padding_y,
                'hidden' => $s->hidden,
                'order' => $s->sort_order,
                'ctaLabel' => $s->cta_label,
                'ctaLink' => $s->cta_link,
                'items' => $s->items_json ?? [],
            ])->all(),
        ];
    }

    protected function serializeNewsEvents(bool $publishedOnly): array
    {
        $newsQuery = NewsItem::query();
        $eventsQuery = EventItem::query();

        if ($publishedOnly) {
            $newsQuery->where('status', 'published');
            $eventsQuery->where('status', 'published');
        }

        $news = $newsQuery->latest('published_at')->get()->map(fn ($n) => [
            'id' => 'news-'.$n->id,
            'type' => $n->type,
            'title' => $n->title,
            'slug' => $n->slug,
            'excerpt' => $n->excerpt ?? '',
            'content' => $n->content ?? '',
            'featuredImage' => $n->featured_image ?? '',
            'imageAlt' => $n->image_alt ?? $n->title,
            'category' => ucfirst($n->type),
            'eventDate' => '',
            'venue' => 'KITS Divili Campus',
            'author' => $n->author ?? 'Administration',
            'publishedAt' => $n->published_at?->format('Y-m-d') ?? '',
            'status' => $n->status,
            'seoTitle' => $n->seo_title ?? $n->title,
            'seoDescription' => $n->seo_description ?? '',
        ]);

        $events = $eventsQuery->latest('event_date')->get()->map(fn ($e) => [
            'id' => 'event-'.$e->id,
            'type' => 'event',
            'title' => $e->title,
            'slug' => $e->slug,
            'excerpt' => $e->excerpt ?? '',
            'content' => $e->content ?? '',
            'featuredImage' => $e->featured_image ?? '',
            'imageAlt' => $e->image_alt ?? $e->title,
            'category' => 'Events',
            'eventDate' => $e->event_date?->format('Y-m-d') ?? '',
            'venue' => $e->venue ?? 'KITS Auditorium',
            'author' => $e->author ?? 'Academic Cell',
            'publishedAt' => $e->published_at?->format('Y-m-d') ?? '',
            'status' => $e->status,
            'seoTitle' => $e->seo_title ?? $e->title,
            'seoDescription' => $e->seo_description ?? '',
        ]);

        return $news->concat($events)->values()->all();
    }
}
