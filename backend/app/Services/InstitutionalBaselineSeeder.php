<?php

namespace App\Services;

use App\Models\AcademicCalendar;
use App\Models\AcademicDocument;
use App\Models\Achievement;
use App\Models\AdmissionCampaign;
use App\Models\Banner;
use App\Models\CampusFacility;
use App\Models\ChatbotFaq;
use App\Models\ChatbotKeyword;
use App\Models\ChatbotSetting;
use App\Models\Department;
use App\Models\EventItem;
use App\Models\Faculty;
use App\Models\FooterSetting;
use App\Models\FormDefinition;
use App\Models\GalleryItem;
use App\Models\HeaderSetting;
use App\Models\Media;
use App\Models\MediaFolder;
use App\Models\Menu;
use App\Models\MenuItem;
use App\Models\NewsItem;
use App\Models\Page;
use App\Models\PageSection;
use App\Models\Permission;
use App\Models\Placement;
use App\Models\Program;
use App\Models\Role;
use App\Models\SeoSetting;
use App\Models\SiteSetting;
use App\Models\Slider;
use App\Models\SliderItem;
use App\Models\SocialLink;
use App\Models\Testimonial;
use App\Models\Theme;
use App\Models\ThemeSetting;
use Illuminate\Support\Facades\DB;

/**
 * Seeds institutional KITS Pharmacy baseline data, RBAC roles/permissions, and themes.
 * IMPORTANT SECURITY RULE:
 * - Never seeds any default/demo administrator account or password.
 * - Never seeds any Admin/CMS/Installer links inside public navigation or footer.
 * - Never seeds fake enquiry records or synthetic analytics trends.
 */
class InstitutionalBaselineSeeder
{
    public function seed(array $config = []): void
    {
        DB::transaction(function () use ($config) {
            $this->seedRolesAndPermissions();
            $this->seedThemes();
            $this->seedHeaderAndFooter($config);
            $this->seedNavigation();
            $this->seedSlidersAndMedia();
            $this->seedPages();
            $this->seedAcademics();
            $this->seedInstitutionalContent();
            $this->seedNewsAndEvents();
            $this->seedChatbot();
            $this->seedFormsAndSettings($config);
        });
    }

    protected function seedRolesAndPermissions(): void
    {
        $permissions = [
            ['key' => 'website_management', 'label' => 'Website & Media Management', 'module' => 'website'],
            ['key' => 'appearance_management', 'label' => 'Appearance & Theme Management', 'module' => 'appearance'],
            ['key' => 'page_management', 'label' => 'Pages & Visual Builder', 'module' => 'pages'],
            ['key' => 'admissions', 'label' => 'Admissions & Enquiries', 'module' => 'admissions'],
            ['key' => 'news', 'label' => 'News, Events & Gallery', 'module' => 'news'],
            ['key' => 'academic_content', 'label' => 'Programs, Departments & Faculty', 'module' => 'academics'],
            ['key' => 'chatbot', 'label' => 'Chatbot & FAQs', 'module' => 'chatbot'],
            ['key' => 'user_management', 'label' => 'Users & Role Permissions', 'module' => 'users'],
            ['key' => 'system_settings', 'label' => 'System Settings & Logs', 'module' => 'system'],
        ];

        $permMap = [];
        foreach ($permissions as $perm) {
            $record = Permission::firstOrCreate(['key' => $perm['key']], $perm);
            $permMap[$perm['key']] = $record->id;
        }

        $roles = [
            'Super Administrator' => [
                'slug' => 'super-administrator',
                'description' => 'Unrestricted institutional CMS & server administration authority.',
                'perms' => array_keys($permMap),
            ],
            'Website Administrator' => [
                'slug' => 'website-administrator',
                'description' => 'Manages themes, header, footer, pages, media, SEO, and modules.',
                'perms' => ['website_management', 'appearance_management', 'page_management', 'admissions', 'news', 'academic_content', 'chatbot'],
            ],
            'Content Editor' => [
                'slug' => 'content-editor',
                'description' => 'Creates and edits pages, sliders, news, events, and media assets.',
                'perms' => ['page_management', 'news'],
            ],
            'Admissions Manager' => [
                'slug' => 'admissions-manager',
                'description' => 'Handles admission campaigns, student enquiries, follow-ups, and exports.',
                'perms' => ['admissions'],
            ],
            'Academic Manager' => [
                'slug' => 'academic-manager',
                'description' => 'Manages programs, departments, syllabi, calendars, and downloads.',
                'perms' => ['academic_content'],
            ],
            'Faculty Manager' => [
                'slug' => 'faculty-manager',
                'description' => 'Maintains faculty profiles, research highlights, and department staff.',
                'perms' => ['academic_content'],
            ],
        ];

        foreach ($roles as $name => $meta) {
            $role = Role::firstOrCreate(
                ['slug' => $meta['slug']],
                ['name' => $name, 'description' => $meta['description']]
            );
            $role->permissions()->sync(array_map(fn ($k) => $permMap[$k], $meta['perms']));
        }
    }

    protected function seedThemes(): void
    {
        if (Theme::count() > 0) {
            return;
        }

        $presets = [
            [
                'slug' => 'royal-purple-gold',
                'name' => 'Royal Purple & Gold',
                'is_active' => true,
                'palette' => [
                    'id' => 'royal-purple-gold', 'name' => 'Royal Purple & Gold',
                    'primaryColor' => '#52128B', 'secondaryColor' => '#32105B',
                    'accentColor' => '#B21A83', 'goldColor' => '#F2C34E',
                    'backgroundColor' => '#FCFAFF', 'surfaceColor' => '#F5F0FC',
                    'cardBackground' => '#FFFFFF', 'headingColor' => '#171238',
                    'bodyTextColor' => '#3A3356', 'linkColor' => '#52128B',
                    'buttonBg' => '#52128B', 'buttonHover' => '#32105B',
                    'headerBg' => '#FFFFFF', 'navBg' => '#32105B',
                    'footerBg' => '#171238', 'borderColor' => '#E8DFF5',
                ],
            ],
            [
                'slug' => 'elegant-lavender',
                'name' => 'Elegant Lavender',
                'is_active' => false,
                'palette' => [
                    'id' => 'elegant-lavender', 'name' => 'Elegant Lavender',
                    'primaryColor' => '#6D28D9', 'secondaryColor' => '#4C1D95',
                    'accentColor' => '#9D174D', 'goldColor' => '#EAB308',
                    'backgroundColor' => '#FAF8FF', 'surfaceColor' => '#F3EEFC',
                    'cardBackground' => '#FFFFFF', 'headingColor' => '#1E1B4B',
                    'bodyTextColor' => '#4338CA', 'linkColor' => '#6D28D9',
                    'buttonBg' => '#6D28D9', 'buttonHover' => '#4C1D95',
                    'headerBg' => '#FFFFFF', 'navBg' => '#4C1D95',
                    'footerBg' => '#1E1B4B', 'borderColor' => '#E4DCF7',
                ],
            ],
            [
                'slug' => 'classic-university',
                'name' => 'Classic University',
                'is_active' => false,
                'palette' => [
                    'id' => 'classic-university', 'name' => 'Classic University',
                    'primaryColor' => '#3B1C63', 'secondaryColor' => '#251042',
                    'accentColor' => '#A11A65', 'goldColor' => '#D4A838',
                    'backgroundColor' => '#FBF9F5', 'surfaceColor' => '#F3EEF9',
                    'cardBackground' => '#FFFFFF', 'headingColor' => '#18142C',
                    'bodyTextColor' => '#3F3A52', 'linkColor' => '#3B1C63',
                    'buttonBg' => '#3B1C63', 'buttonHover' => '#251042',
                    'headerBg' => '#FFFFFF', 'navBg' => '#251042',
                    'footerBg' => '#120D24', 'borderColor' => '#E5E0EC',
                ],
            ],
            [
                'slug' => 'deep-purple',
                'name' => 'Deep Purple',
                'is_active' => false,
                'palette' => [
                    'id' => 'deep-purple', 'name' => 'Deep Purple',
                    'primaryColor' => '#4A0E78', 'secondaryColor' => '#280747',
                    'accentColor' => '#C0267D', 'goldColor' => '#F5C451',
                    'backgroundColor' => '#F9F6FE', 'surfaceColor' => '#EFE7FA',
                    'cardBackground' => '#FFFFFF', 'headingColor' => '#160B2E',
                    'bodyTextColor' => '#382C54', 'linkColor' => '#4A0E78',
                    'buttonBg' => '#4A0E78', 'buttonHover' => '#280747',
                    'headerBg' => '#FFFFFF', 'navBg' => '#280747',
                    'footerBg' => '#140826', 'borderColor' => '#DFD2F2',
                ],
            ],
        ];

        foreach ($presets as $p) {
            $theme = Theme::create([
                'slug' => $p['slug'],
                'name' => $p['name'],
                'is_preset' => true,
                'is_active' => $p['is_active'],
                'palette_json' => $p['palette'],
            ]);

            if ($p['is_active']) {
                ThemeSetting::create([
                    'theme_id' => $theme->id,
                    'typography_json' => [
                        'headingFont' => 'Playfair Display',
                        'bodyFont' => 'Plus Jakarta Sans',
                        'baseFontSize' => 16,
                        'headingWeight' => 700,
                        'lineHeight' => 1.65,
                        'headingTracking' => '-0.02em',
                    ],
                    'layout_json' => [
                        'contentWidth' => '1280px',
                        'headerHeight' => 76,
                        'footerStyle' => 'multi-column',
                        'sectionSpacing' => 64,
                        'cardRadius' => 16,
                        'buttonRadius' => 9999,
                        'shadowIntensity' => 'subtle',
                        'stickyHeader' => true,
                    ],
                ]);
            }
        }
    }

    protected function seedHeaderAndFooter(array $config): void
    {
        if (HeaderSetting::count() === 0) {
            HeaderSetting::create([
                'college_name' => 'KITS',
                'college_subtitle' => 'COLLEGE OF PHARMACY FOR WOMEN',
                'location_short' => 'Divili, Peddapuram Mandal, Kakinada District, Andhra Pradesh – 533433',
                'affiliation_text' => 'Affiliated to JNTU Kakinada',
                'approval_text' => 'PCI Approved',
                'phone' => $config['contactPhone'] ?? '+91 97015 18708',
                'secondary_phone' => '08852 247550',
                'email' => $config['contactEmail'] ?? 'kitspharmacollege@gmail.com',
                'working_hours' => 'Mon – Sat: 9:30 AM – 4:30 PM',
                'announcement_text' => 'Admissions Enquiry Open for Academic Session 2026–27 · B.Pharmacy Program',
                'announcement_link' => '/admissions',
                'show_announcement' => true,
                'exam_portal_label' => 'Examination',
                'exam_portal_url' => '/academics/examination-cell',
                'student_portal_label' => 'Student Portal',
                'student_portal_url' => '/academics/syllabus',
                'default_language' => 'English',
                'apply_button_label' => 'Apply Now',
                'apply_button_path' => '/admissions',
                'logo_url' => 'svg-emblem',
                'header_bg' => '#FFFFFF',
                'header_text_color' => '#171238',
                'nav_bg' => '#32105B',
                'nav_text_color' => '#FFFFFF',
                'sticky' => true,
            ]);
        }

        if (FooterSetting::count() === 0) {
            FooterSetting::create([
                'logo_url' => 'svg-emblem',
                'intro_text' => 'Dedicated to empowering women through quality pharmaceutical education, ethical scientific inquiry, and compassionate healthcare leadership in Andhra Pradesh.',
                'address' => 'Tirupati (V), Divili, Peddapuram Mandal, Kakinada District, Andhra Pradesh – 533433',
                'phone' => $config['contactPhone'] ?? '+91 97015 18708',
                'email' => $config['contactEmail'] ?? 'kitspharmacollege@gmail.com',
                'copyright_text' => '© 2026 KITS College of Pharmacy for Women. All rights reserved. Designed by Infiniforge Technologies.',
                'background_color' => '#171238',
                'text_color' => '#EAE4F5',
                'columns_json' => [
                    [
                        'id' => 'fc-quick',
                        'title' => 'Quick Links',
                        'links' => [
                            ['id' => 'fl-1', 'label' => 'About Us', 'path' => '/about'],
                            ['id' => 'fl-2', 'label' => 'Admissions', 'path' => '/admissions'],
                            ['id' => 'fl-3', 'label' => 'Departments', 'path' => '/departments'],
                            ['id' => 'fl-4', 'label' => 'Faculty Directory', 'path' => '/faculty'],
                            ['id' => 'fl-5', 'label' => 'Achievements', 'path' => '/achievements'],
                        ],
                    ],
                    [
                        'id' => 'fc-acad',
                        'title' => 'Academics',
                        'links' => [
                            ['id' => 'fl-6', 'label' => 'Programs Offered', 'path' => '/academics/programs'],
                            ['id' => 'fl-7', 'label' => 'Syllabus', 'path' => '/academics/syllabus'],
                            ['id' => 'fl-8', 'label' => 'Academic Calendar', 'path' => '/academics/calendar'],
                            ['id' => 'fl-9', 'label' => 'Examination Cell', 'path' => '/academics/examination-cell'],
                            ['id' => 'fl-10', 'label' => 'Placements Cell', 'path' => '/placements'],
                        ],
                    ],
                    [
                        'id' => 'fc-useful',
                        'title' => 'Useful Links',
                        'links' => [
                            ['id' => 'fl-11', 'label' => 'Campus Life', 'path' => '/campus-life'],
                            ['id' => 'fl-12', 'label' => 'Photo & Video Gallery', 'path' => '/gallery'],
                            ['id' => 'fl-13', 'label' => 'Downloads', 'path' => '/downloads'],
                            ['id' => 'fl-14', 'label' => 'Feedback', 'path' => '/feedback'],
                            ['id' => 'fl-15', 'label' => 'Contact Us', 'path' => '/contact'],
                        ],
                    ],
                ],
                'custom_block_title' => 'Institutional Office Hours',
                'custom_block_content' => 'Monday to Saturday, 9:30 AM – 4:30 PM IST (Closed on Public Holidays)',
            ]);
        }

        if (SocialLink::count() === 0) {
            foreach (['facebook', 'instagram', 'youtube', 'linkedin', 'x'] as $idx => $plat) {
                SocialLink::create([
                    'platform' => $plat,
                    'url' => "https://{$plat}.com",
                    'sort_order' => $idx + 1,
                    'is_active' => true,
                ]);
            }
        }
    }

    protected function seedNavigation(): void
    {
        if (Menu::count() > 0) {
            return;
        }

        $menu = Menu::create([
            'location' => 'primary',
            'name' => 'Primary Website Navigation',
            'slug' => 'primary-nav',
        ]);

        $items = [
            ['label' => 'Home', 'path' => '/'],
            [
                'label' => 'About Us', 'path' => '/about',
                'children' => [
                    ['label' => 'College Overview', 'path' => '/about'],
                    ['label' => 'History & Legacy', 'path' => '/about/history'],
                    ['label' => 'Vision & Mission', 'path' => '/about/vision-mission'],
                    ['label' => "Principal's Message", 'path' => '/about/principal-message'],
                    ['label' => 'Governance', 'path' => '/about/governance'],
                ],
            ],
            [
                'label' => 'Academics', 'path' => '/academics',
                'children' => [
                    ['label' => 'Academic Overview', 'path' => '/academics'],
                    ['label' => 'Programs Offered', 'path' => '/academics/programs'],
                    ['label' => 'Academic Calendar', 'path' => '/academics/calendar'],
                    ['label' => 'Syllabus & Regulations', 'path' => '/academics/syllabus'],
                    ['label' => 'Examination Cell', 'path' => '/academics/examination-cell'],
                    ['label' => 'Faculty Directory', 'path' => '/faculty'],
                ],
            ],
            [
                'label' => 'Admissions', 'path' => '/admissions',
                'children' => [
                    ['label' => 'Admissions Overview', 'path' => '/admissions'],
                    ['label' => 'Eligibility Criteria', 'path' => '/admissions/eligibility'],
                    ['label' => 'Application Process', 'path' => '/admissions/process'],
                ],
            ],
            [
                'label' => 'Departments', 'path' => '/departments',
                'children' => [
                    ['label' => 'All Departments', 'path' => '/departments'],
                    ['label' => 'Pharmaceutics', 'path' => '/departments/pharmaceutics'],
                    ['label' => 'Pharmacology', 'path' => '/departments/pharmacology'],
                    ['label' => 'Pharmaceutical Chemistry', 'path' => '/departments/pharmaceutical-chemistry'],
                    ['label' => 'Pharmacognosy', 'path' => '/departments/pharmacognosy'],
                    ['label' => 'Pharmaceutical Analysis', 'path' => '/departments/pharmaceutical-analysis'],
                    ['label' => 'Pharmacy Practice', 'path' => '/departments/pharmacy-practice'],
                ],
            ],
            [
                'label' => 'Campus Life', 'path' => '/campus-life',
                'children' => [
                    ['label' => 'Campus Overview', 'path' => '/campus-life'],
                    ['label' => 'Central Library', 'path' => '/campus-life/library'],
                    ['label' => 'Laboratories', 'path' => '/campus-life/laboratories'],
                    ['label' => 'Medicinal Garden', 'path' => '/campus-life/medicinal-garden'],
                    ['label' => 'Hostel & Canteen', 'path' => '/campus-life/hostel-facilities'],
                    ['label' => 'Sports & Green Campus', 'path' => '/campus-life/sports-recreation'],
                ],
            ],
            ['label' => 'Achievements', 'path' => '/achievements'],
            ['label' => 'Placements', 'path' => '/placements'],
            ['label' => 'Gallery', 'path' => '/gallery'],
            ['label' => 'News & Events', 'path' => '/news'],
            ['label' => 'Contact', 'path' => '/contact'],
        ];

        foreach ($items as $order => $item) {
            $parent = MenuItem::create([
                'menu_id' => $menu->id,
                'label' => $item['label'],
                'path' => $item['path'],
                'sort_order' => $order + 1,
                'enabled' => true,
            ]);

            foreach ($item['children'] ?? [] as $childOrder => $child) {
                MenuItem::create([
                    'menu_id' => $menu->id,
                    'parent_id' => $parent->id,
                    'label' => $child['label'],
                    'path' => $child['path'],
                    'sort_order' => $childOrder + 1,
                    'enabled' => true,
                ]);
            }
        }
    }

    protected function seedSlidersAndMedia(): void
    {
        if (MediaFolder::count() === 0) {
            foreach (['Campus', 'Laboratories', 'Logos', 'Faculty', 'Events', 'Documents', 'Banners'] as $folder) {
                MediaFolder::create(['name' => $folder, 'slug' => strtolower($folder)]);
            }
        }

        if (Media::count() === 0) {
            $baseAssets = [
                ['folder_name' => 'Laboratories', 'title' => 'Pharmacy Formulation Lab', 'alt_text' => 'Pharmacy student inspecting glassware beside microscope', 'type' => 'image', 'public_url' => '/src/assets/images/hero_pharmacy_lab_1794818460854.jpg', 'file_size_label' => '420 KB', 'dimensions' => '1600x900'],
                ['folder_name' => 'Campus', 'title' => 'KITS Campus Building', 'alt_text' => 'KITS College of Pharmacy for Women main academic block in Divili', 'type' => 'image', 'public_url' => '/src/assets/images/hero_campus_building_1794818461158.jpg', 'file_size_label' => '510 KB', 'dimensions' => '1600x900'],
                ['folder_name' => 'Events', 'title' => 'Pharmaceutical Research Seminar', 'alt_text' => 'Academic research seminar and laboratory mentoring', 'type' => 'image', 'public_url' => '/src/assets/images/hero_research_seminar_1794818461364.jpg', 'file_size_label' => '390 KB', 'dimensions' => '1600x900'],
                ['folder_name' => 'Campus', 'title' => 'Central Pharmacy Library', 'alt_text' => 'Students studying inside the KITS central library', 'type' => 'image', 'public_url' => '/src/assets/images/campus_library_1794818460849.jpg', 'file_size_label' => '460 KB', 'dimensions' => '1200x800'],
                ['folder_name' => 'Campus', 'title' => 'Botanical & Medicinal Garden', 'alt_text' => 'Medicinal plants cultivated for Pharmacognosy studies', 'type' => 'image', 'public_url' => '/src/assets/images/campus_medicinal_garden_1794818462926.jpg', 'file_size_label' => '495 KB', 'dimensions' => '1200x800'],
                ['folder_name' => 'Banners', 'title' => 'Admissions Student Portrait', 'alt_text' => 'Women pharmacy undergraduate student on campus', 'type' => 'image', 'public_url' => '/src/assets/images/admissions_student_portrait_1794818462254.jpg', 'file_size_label' => '380 KB', 'dimensions' => '900x1100'],
            ];

            foreach ($baseAssets as $asset) {
                Media::create($asset);
            }
        }

        if (Slider::count() === 0) {
            $slider = Slider::create(['name' => 'Homepage Hero Carousel', 'slug' => 'home-hero', 'is_active' => true]);
            SliderItem::create([
                'slider_id' => $slider->id,
                'badge' => 'A Premier Institution for Women in Pharmaceutical Education',
                'heading' => 'Empowering Women in',
                'highlighted_text' => 'Pharmaceutical Sciences',
                'subheading' => 'Quality Education & Scientific Rigor',
                'description' => 'Discover quality pharmaceutical education, research opportunities and a future filled with possibilities at Divili, Kakinada District.',
                'desktop_image' => '/src/assets/images/hero_pharmacy_lab_1794818460854.jpg',
                'mobile_image' => '/src/assets/images/hero_pharmacy_lab_1794818460854.jpg',
                'image_alt' => 'Pharmacy student examining laboratory glassware beside an optical microscope',
                'primary_cta_label' => 'Explore Programs',
                'primary_cta_link' => '/academics/programs',
                'secondary_cta_label' => 'Apply Now',
                'secondary_cta_link' => '/admissions',
                'overlay_opacity' => 85,
                'text_position' => 'left',
                'animation' => 'fade',
                'duration_ms' => 6000,
                'sort_order' => 1,
                'active' => true,
            ]);
            SliderItem::create([
                'slider_id' => $slider->id,
                'badge' => 'Approved by PCI · Affiliated to JNTU Kakinada',
                'heading' => 'Shaping Future',
                'highlighted_text' => 'Healthcare Leaders',
                'subheading' => 'Modern Campus & Women-Centric Mentorship',
                'description' => 'Our green campus in Peddapuram Mandal blends well-equipped laboratories, central library resources, and experienced faculty mentorship.',
                'desktop_image' => '/src/assets/images/hero_campus_building_1794818461158.jpg',
                'mobile_image' => '/src/assets/images/hero_campus_building_1794818461158.jpg',
                'image_alt' => 'KITS College of Pharmacy for Women main academic building',
                'primary_cta_label' => 'About KITS Pharmacy',
                'primary_cta_link' => '/about',
                'secondary_cta_label' => 'Campus Life',
                'secondary_cta_link' => '/campus-life',
                'overlay_opacity' => 82,
                'text_position' => 'left',
                'animation' => 'slide',
                'duration_ms' => 6500,
                'sort_order' => 2,
                'active' => true,
            ]);
        }

        if (Banner::count() === 0) {
            Banner::create([
                'title' => 'Admissions Enquiry Open 2026–27',
                'subtitle' => 'Join B.Pharmacy and M.Pharmacy programs approved by PCI and affiliated to JNTU Kakinada.',
                'cta_label' => 'Apply Now',
                'cta_link' => '/admissions',
                'image_url' => '/src/assets/images/admissions_student_portrait_1794818462254.jpg',
                'placement' => 'homepage',
                'active' => true,
            ]);
        }
    }

    protected function seedPages(): void
    {
        if (Page::count() > 0) {
            return;
        }

        $pages = [
            ['title' => 'Home', 'slug' => 'home', 'is_system_route' => true, 'seo_title' => 'KITS College of Pharmacy for Women | Divili, Andhra Pradesh', 'seo_description' => 'Official website of KITS College of Pharmacy for Women, Divili — Empowering women in pharmaceutical sciences.'],
            ['title' => 'About Us', 'slug' => 'about', 'is_system_route' => true, 'seo_title' => 'About KITS College of Pharmacy for Women', 'seo_description' => 'Learn about our history, mission, governance, and commitment to women in pharmaceutical sciences.'],
            ['title' => 'Academics', 'slug' => 'academics', 'is_system_route' => true, 'seo_title' => 'Academics & Programs | KITS College of Pharmacy for Women', 'seo_description' => 'Explore B.Pharmacy, M.Pharmacy, JNTUK syllabus, academic calendar, and examination cell.'],
            ['title' => 'Admissions', 'slug' => 'admissions', 'is_system_route' => true, 'seo_title' => 'Admissions 2026–27 | KITS College of Pharmacy for Women', 'seo_description' => 'Submit an admission enquiry for B.Pharmacy and M.Pharmacy programs at KITS Divili.'],
            ['title' => 'Departments', 'slug' => 'departments', 'is_system_route' => true, 'seo_title' => 'Academic Departments | KITS College of Pharmacy for Women', 'seo_description' => 'Explore Pharmaceutics, Pharmacology, Pharmaceutical Chemistry, Pharmacognosy, Analysis, and Practice.'],
            ['title' => 'Campus Life', 'slug' => 'campus-life', 'is_system_route' => true, 'seo_title' => 'Campus Life & Facilities | KITS College of Pharmacy for Women', 'seo_description' => 'Central Library, Laboratories, Medicinal Garden, Hostel, Sports, and Green Campus.'],
        ];

        foreach ($pages as $p) {
            $page = Page::create([
                'title' => $p['title'],
                'slug' => $p['slug'],
                'status' => 'published',
                'enabled' => true,
                'is_system_route' => $p['is_system_route'],
                'seo_title' => $p['seo_title'],
                'seo_description' => $p['seo_description'],
            ]);

            PageSection::create([
                'page_id' => $page->id,
                'type' => 'text',
                'title' => $p['title'].' — KITS College of Pharmacy for Women',
                'subtitle' => 'Divili, Peddapuram Mandal, Kakinada District, Andhra Pradesh',
                'body' => 'Manage this page content dynamically via the KITS CMS Page Builder.',
                'background' => 'default',
                'padding_y' => 'md',
                'hidden' => false,
                'sort_order' => 1,
            ]);
        }
    }

    protected function seedAcademics(): void
    {
        if (Program::count() === 0) {
            Program::create([
                'name' => 'Bachelor of Pharmacy (B.Pharmacy)',
                'code' => 'BPHARM',
                'level' => 'UG',
                'qualification' => 'Undergraduate Professional Degree',
                'duration' => '4 Years (8 Semesters)',
                'eligibility' => '10+2 (BiPC / MPC) with minimum qualifying marks as per APSCHE / PCI norms; AP EAPCET / Management quota.',
                'description' => 'Comprehensive 4-year undergraduate pharmaceutical sciences degree building expertise in drug formulation, pharmacology, medicinal chemistry, pharmacognosy, and clinical pharmacy.',
                'intake_capacity' => 'As per PCI & JNTU Kakinada sanctioned intake',
                'admission_info' => 'Admissions through AP EAPCET counselling and Institutional Management Quota.',
                'brochure_url' => '/downloads',
                'verification_status' => 'verified',
                'active' => true,
                'sort_order' => 1,
            ]);
            Program::create([
                'name' => 'Master of Pharmacy (M.Pharmacy)',
                'code' => 'MPHARM',
                'level' => 'PG',
                'qualification' => 'Postgraduate Specialization Degree',
                'duration' => '2 Years (4 Semesters)',
                'eligibility' => 'B.Pharmacy degree with valid GPAT / AP PGECET score as per regulatory norms.',
                'description' => 'Research-intensive postgraduate curriculum preparing scholars for R&D, regulatory affairs, clinical trials, and academic leadership.',
                'intake_capacity' => 'Specializations subject to PCI / JNTUK approval',
                'admission_info' => 'Admissions via AP PGECET / GPAT counselling and institutional intake.',
                'brochure_url' => '/downloads',
                'verification_status' => 'pending_verification',
                'active' => true,
                'sort_order' => 2,
            ]);
        }

        if (Department::count() === 0) {
            $depts = [
                ['slug' => 'pharmaceutics', 'name' => 'Pharmaceutics', 'icon_name' => 'Pill', 'short_description' => 'Dosage form design, novel drug delivery systems, and industrial pharmacy operations.', 'image_url' => '/src/assets/images/hero_pharmacy_lab_1794818460854.jpg'],
                ['slug' => 'pharmacology', 'name' => 'Pharmacology', 'icon_name' => 'HeartPulse', 'short_description' => 'Drug action mechanisms, preclinical screening, toxicology, and therapeutic evaluation.', 'image_url' => '/src/assets/images/hero_research_seminar_1794818461364.jpg'],
                ['slug' => 'pharmaceutical-chemistry', 'name' => 'Pharmaceutical Chemistry', 'icon_name' => 'FlaskConical', 'short_description' => 'Organic synthesis, medicinal chemistry, SAR studies, and impurity profiling.', 'image_url' => '/src/assets/images/hero_pharmacy_lab_1794818460854.jpg'],
                ['slug' => 'pharmacognosy', 'name' => 'Pharmacognosy', 'icon_name' => 'Leaf', 'short_description' => 'Medicinal plant authentication, phytochemistry, herbal formulations, and standardizations.', 'image_url' => '/src/assets/images/campus_medicinal_garden_1794818462926.jpg'],
                ['slug' => 'pharmaceutical-analysis', 'name' => 'Pharmaceutical Analysis', 'icon_name' => 'BarChart3', 'short_description' => 'Chromatographic, spectroscopic, and titrimetric quality control methods.', 'image_url' => '/src/assets/images/hero_research_seminar_1794818461364.jpg'],
                ['slug' => 'pharmacy-practice', 'name' => 'Pharmacy Practice', 'icon_name' => 'Stethoscope', 'short_description' => 'Hospital pharmacy, patient counselling, pharmacovigilance, and clinical care.', 'image_url' => '/src/assets/images/campus_library_1794818460849.jpg'],
            ];

            foreach ($depts as $idx => $d) {
                Department::create([
                    'slug' => $d['slug'],
                    'name' => $d['name'],
                    'short_description' => $d['short_description'],
                    'introduction' => 'The Department of '.$d['name'].' equips women pharmacy scholars with rigorous theoretical knowledge and hands-on laboratory proficiency aligned with PCI & JNTU Kakinada standards.',
                    'icon_name' => $d['icon_name'],
                    'image_url' => $d['image_url'],
                    'image_alt' => $d['name'].' laboratory and academic studio at KITS College of Pharmacy for Women',
                    'facilities_json' => ['Dedicated UG Laboratory', 'Instrumentation Support', 'Department Seminar Library'],
                    'laboratories_json' => [$d['name'].' Lab I', $d['name'].' Research Lab'],
                    'research_areas_json' => ['Formulation & Quality Assurance', 'Evidence-Based Healthcare Studies'],
                    'publications_json' => ['Peer-reviewed faculty publications updated per academic year.'],
                    'verification_status' => 'verified',
                    'active' => true,
                    'sort_order' => $idx + 1,
                ]);
            }
        }

        if (Faculty::count() === 0) {
            $deptIds = Department::pluck('id', 'slug');
            $facultyRows = [
                ['name' => 'Dr. P. Lakshmi Devi', 'designation' => 'Principal & Professor', 'qualification' => 'M.Pharm., Ph.D.', 'experience' => '16+ Years', 'dept' => 'pharmaceutics'],
                ['name' => 'Dr. K. Madhavi', 'designation' => 'Professor & HOD', 'qualification' => 'M.Pharm., Ph.D.', 'experience' => '12+ Years', 'dept' => 'pharmacology'],
                ['name' => 'Mrs. S. Anitha Kumari', 'designation' => 'Associate Professor', 'qualification' => 'M.Pharm.', 'experience' => '9+ Years', 'dept' => 'pharmaceutical-chemistry'],
                ['name' => 'Mrs. R. Swapna', 'designation' => 'Assistant Professor', 'qualification' => 'M.Pharm.', 'experience' => '7+ Years', 'dept' => 'pharmacognosy'],
            ];

            foreach ($facultyRows as $idx => $f) {
                $fac = Faculty::create([
                    'name' => $f['name'],
                    'photo_url' => '/src/assets/images/admissions_student_portrait_1794818462254.jpg',
                    'photo_alt' => $f['name'].' portrait',
                    'designation' => $f['designation'],
                    'qualification' => $f['qualification'],
                    'experience' => $f['experience'],
                    'biography' => $f['name'].' serves at KITS College of Pharmacy for Women mentoring undergraduate and postgraduate pharmacy scholars.',
                    'email' => 'kitspharmacollege@gmail.com',
                    'research_interests_json' => ['Pharmaceutical Education', 'Drug Delivery & Safety'],
                    'publications_count' => 8,
                    'sort_order' => $idx + 1,
                    'active' => true,
                    'verification_status' => 'pending_verification',
                ]);
                if (isset($deptIds[$f['dept']])) {
                    $fac->departments()->attach($deptIds[$f['dept']], ['is_head' => $idx <= 1]);
                }
            }
        }

        if (AcademicDocument::count() === 0) {
            AcademicDocument::create([
                'title' => 'B.Pharmacy PCI Syllabus & JNTUK Regulations (R23/PCI)',
                'category' => 'Syllabus',
                'file_url' => '/academics/syllabus',
                'file_size' => '1.4 MB',
                'published_date' => '2026-06-01',
                'active' => true,
            ]);
            AcademicDocument::create([
                'title' => 'Academic Calendar 2026–27 (Tentative)',
                'category' => 'Academic Calendar',
                'file_url' => '/academics/calendar',
                'file_size' => '820 KB',
                'published_date' => '2026-06-15',
                'active' => true,
            ]);
        }

        if (AcademicCalendar::count() === 0) {
            AcademicCalendar::create([
                'academic_year' => '2026-27',
                'title' => 'Odd Semester Instructional Schedule',
                'semester' => 'Semesters I, III, V, VII',
                'start_date' => '2026-07-01',
                'end_date' => '2026-11-30',
                'document_url' => '/academics/calendar',
                'active' => true,
            ]);
        }
    }

    protected function seedInstitutionalContent(): void
    {
        if (CampusFacility::count() === 0) {
            $facilities = [
                ['slug' => 'library', 'title' => 'Central Library', 'category' => 'Academic Infrastructure', 'summary' => 'Well-stocked pharmacy reference volumes, national & international journals, and digital e-resources.', 'image_url' => '/src/assets/images/campus_library_1794818460849.jpg'],
                ['slug' => 'laboratories', 'title' => 'Pharmaceutical Laboratories', 'category' => 'Research & Labs', 'summary' => 'Dedicated PCI-compliant laboratories for Pharmaceutics, Pharmacology, Chemistry, Analysis, and Pharmacognosy.', 'image_url' => '/src/assets/images/hero_pharmacy_lab_1794818460854.jpg'],
                ['slug' => 'medicinal-garden', 'title' => 'Medicinal & Herbal Garden', 'category' => 'Botanical Campus', 'summary' => 'Curated medicinal flora supporting live Pharmacognosy identification and phytochemical research.', 'image_url' => '/src/assets/images/campus_medicinal_garden_1794818462926.jpg'],
                ['slug' => 'hostel-facilities', 'title' => 'Safe Women Hostel & Canteen', 'category' => 'Student Welfare', 'summary' => 'Secure residential accommodation with hygienic dining and 24x7 campus supervision.', 'image_url' => '/src/assets/images/hero_campus_building_1794818461158.jpg'],
                ['slug' => 'sports-recreation', 'title' => 'Sports & Green Campus', 'category' => 'Recreation', 'summary' => 'Lush eco-friendly grounds encouraging athletics, yoga, and holistic campus well-being.', 'image_url' => '/src/assets/images/hero_campus_building_1794818461158.jpg'],
            ];

            foreach ($facilities as $idx => $fac) {
                CampusFacility::create([
                    'slug' => $fac['slug'],
                    'title' => $fac['title'],
                    'category' => $fac['category'],
                    'summary' => $fac['summary'],
                    'details' => $fac['summary'].' Students benefit from structured guidance, safety standards, and serene academic spaces.',
                    'highlights_json' => ['PCI Norms Compliant', 'Guided Student Access', 'Women-Safe Campus Environment'],
                    'image_url' => $fac['image_url'],
                    'image_alt' => $fac['title'].' at KITS College of Pharmacy for Women',
                    'active' => true,
                    'sort_order' => $idx + 1,
                ]);
            }
        }

        if (Achievement::count() === 0) {
            Achievement::create([
                'category' => 'Institutional',
                'title' => 'Consistent JNTU Kakinada University Examination Results',
                'recipient' => 'KITS College of Pharmacy for Women',
                'year' => '2025',
                'description' => 'Graduating cohorts achieved strong university pass percentages and distinction honors across B.Pharmacy semesters.',
                'image_url' => '/src/assets/images/hero_research_seminar_1794818461364.jpg',
                'verification_status' => 'verified',
                'active' => true,
            ]);
        }

        if (Placement::count() === 0) {
            Placement::create([
                'company_name' => 'Aurobindo Pharma / Leading Healthcare Partners',
                'sector' => 'Pharmaceutical Manufacturing & QA',
                'role_title' => 'Quality Assurance & Production Trainees',
                'year' => '2025',
                'notes' => 'Campus career readiness cell conducts GPAT coaching, interview workshops, and industry recruitment drives.',
                'verification_status' => 'pending_verification',
                'active' => true,
            ]);
        }

        if (Testimonial::count() === 0) {
            Testimonial::create([
                'student_name' => 'K. Sai Pravallika',
                'photo_url' => '/src/assets/images/admissions_student_portrait_1794818462254.jpg',
                'course' => 'B.Pharmacy',
                'graduation_year' => '2025',
                'quote' => 'KITS College of Pharmacy for Women gave me strong laboratory confidence, caring faculty mentors, and a safe residential campus to pursue pharmaceutical sciences.',
                'verification_status' => 'verified',
                'active' => true,
            ]);
        }

        if (GalleryItem::count() === 0) {
            $items = [
                ['category_name' => 'Campus', 'title' => 'Academic Block Overview', 'url' => '/src/assets/images/hero_campus_building_1794818461158.jpg'],
                ['category_name' => 'Laboratories', 'title' => 'Formulation & Microscopy Lab', 'url' => '/src/assets/images/hero_pharmacy_lab_1794818460854.jpg'],
                ['category_name' => 'Seminars', 'title' => 'Faculty & Student Research Seminar', 'url' => '/src/assets/images/hero_research_seminar_1794818461364.jpg'],
                ['category_name' => 'Campus', 'title' => 'Central Pharmacy Library', 'url' => '/src/assets/images/campus_library_1794818460849.jpg'],
                ['category_name' => 'Campus', 'title' => 'Herbal & Medicinal Garden', 'url' => '/src/assets/images/campus_medicinal_garden_1794818462926.jpg'],
            ];
            foreach ($items as $it) {
                GalleryItem::create([
                    'category_name' => $it['category_name'],
                    'title' => $it['title'],
                    'media_type' => 'photo',
                    'url' => $it['url'],
                    'alt_text' => $it['title'],
                    'captured_date' => '2026-01-15',
                    'active' => true,
                ]);
            }
        }
    }

    protected function seedNewsAndEvents(): void
    {
        if (NewsItem::count() === 0) {
            NewsItem::create([
                'type' => 'announcement',
                'title' => 'Admissions Open for B.Pharmacy & M.Pharmacy (2026–27)',
                'slug' => 'admissions-open-2026-27',
                'excerpt' => 'Prospective women scholars can submit admission enquiries online or visit the Divili campus admission cell.',
                'content' => 'KITS College of Pharmacy for Women invites applications for B.Pharmacy and M.Pharmacy programs approved by PCI and affiliated to JNTU Kakinada.',
                'featured_image' => '/src/assets/images/admissions_student_portrait_1794818462254.jpg',
                'image_alt' => 'Admissions open 2026-27 banner',
                'author' => 'Admissions Office',
                'status' => 'published',
                'published_at' => '2026-06-01',
                'seo_title' => 'Admissions Open 2026-27 | KITS Pharmacy',
                'seo_description' => 'Apply for B.Pharmacy and M.Pharmacy at KITS College of Pharmacy for Women, Divili.',
            ]);
        }

        if (EventItem::count() === 0) {
            EventItem::create([
                'title' => 'National Pharmacy Week & Research Poster Symposium',
                'slug' => 'national-pharmacy-week-symposium',
                'excerpt' => 'Annual student scientific poster presentation and community health awareness outreach.',
                'content' => 'Departments across KITS College of Pharmacy for Women host scientific seminars, medicinal garden walks, and patient safety workshops.',
                'featured_image' => '/src/assets/images/hero_research_seminar_1794818461364.jpg',
                'image_alt' => 'Pharmacy seminar session',
                'event_date' => '2026-11-20',
                'venue' => 'KITS Auditorium, Divili Campus',
                'author' => 'Academic Cell',
                'status' => 'published',
                'published_at' => '2026-08-01',
                'seo_title' => 'National Pharmacy Week | KITS Divili',
                'seo_description' => 'Student research symposium and outreach events at KITS College of Pharmacy for Women.',
            ]);
        }
    }

    protected function seedChatbot(): void
    {
        if (ChatbotSetting::count() === 0) {
            ChatbotSetting::create([
                'enabled' => true,
                'name' => 'KITS AI Assistant',
                'avatar_url' => '',
                'welcome_message' => "Hello! I'm your KITS Assistant. Ask me about B.Pharmacy & M.Pharmacy admissions, eligibility, departments, campus hostel, or contact details.",
                'primary_color' => '#52128B',
                'suggested_questions_json' => [
                    'About the College',
                    'Courses & Eligibility',
                    'Admission Process',
                    'Campus Facilities & Hostel',
                    'Contact Details',
                ],
                'fallback_message' => 'Thank you for your question! For specific official assistance, please call +91 97015 18708 or submit an enquiry on our Admissions page.',
                'ai_enabled' => true,
                'ai_model' => config('services.gemini.model', 'gemini-4-hydrogen'),
                'retention_days' => 90,
            ]);
        }

        if (ChatbotFaq::count() === 0) {
            $faqs = [
                [
                    'category' => 'College Information',
                    'question' => 'Tell me about KITS College of Pharmacy for Women',
                    'answer' => 'KITS College of Pharmacy for Women is located at Divili, Peddapuram Mandal, Kakinada District, Andhra Pradesh (533433). Established in 2019, it is approved by PCI and affiliated to JNTU Kakinada.',
                    'keywords' => ['about', 'college', 'kits', 'divili', 'kakinada', 'jntuk', 'pci'],
                ],
                [
                    'category' => 'Courses',
                    'question' => 'What courses and eligibility criteria are offered?',
                    'answer' => 'We offer B.Pharmacy (4 Years, 10+2 BiPC/MPC + AP EAPCET) and M.Pharmacy (2 Years, B.Pharmacy + GPAT/AP PGECET). Visit /academics/programs for full details.',
                    'keywords' => ['courses', 'b.pharm', 'bpharm', 'm.pharm', 'mpharm', 'eligibility', 'duration'],
                ],
                [
                    'category' => 'Admissions',
                    'question' => 'How can I apply for admission?',
                    'answer' => 'You can submit an online Admission Enquiry right here at /admissions or reach the Admissions Cell at +91 97015 18708 (Mon–Sat, 9:30 AM–4:30 PM).',
                    'keywords' => ['admission', 'apply', 'process', 'eapcet', 'pgecet', 'seat', 'fees', 'scholarship'],
                ],
                [
                    'category' => 'Facilities',
                    'question' => 'What campus facilities and hostel amenities are available?',
                    'answer' => 'The campus features PCI-approved Pharmaceutics, Pharmacology, Chemistry & Analysis labs, a Central Library, Medicinal Garden, safe women’s hostel, canteen, and green sports grounds.',
                    'keywords' => ['hostel', 'library', 'lab', 'facilities', 'campus', 'canteen', 'bus', 'transport'],
                ],
                [
                    'category' => 'Contact',
                    'question' => 'What are the official college contact details?',
                    'answer' => 'Phone: +91 97015 18708 / 08852 247550 | Email: kitspharmacollege@gmail.com | Address: Tirupati (V), Divili, Peddapuram Mandal, Kakinada District, AP – 533433.',
                    'keywords' => ['contact', 'phone', 'email', 'address', 'location', 'hours'],
                ],
            ];

            foreach ($faqs as $idx => $faq) {
                $record = ChatbotFaq::create([
                    'category_name' => $faq['category'],
                    'question' => $faq['question'],
                    'answer' => $faq['answer'],
                    'enabled' => true,
                    'sort_order' => $idx + 1,
                ]);
                foreach ($faq['keywords'] as $kw) {
                    ChatbotKeyword::create(['faq_id' => $record->id, 'keyword' => strtolower($kw)]);
                }
            }
        }
    }

    protected function seedFormsAndSettings(array $config): void
    {
        if (AdmissionCampaign::count() === 0) {
            AdmissionCampaign::create([
                'academic_year' => '2026–27',
                'admissions_open' => true,
                'headline' => 'Admissions Enquiry Open for 2026–27',
                'subtext' => 'Submit your details to connect with our Academic Admissions Guidance Team.',
                'important_dates_json' => [
                    ['label' => 'Online Enquiry Portal', 'date' => 'Open Now'],
                    ['label' => 'AP EAPCET Counselling Window', 'date' => 'As per APSCHE Schedule'],
                    ['label' => 'Commencement of Classes', 'date' => 'As per JNTUK Calendar'],
                ],
                'scholarship_note' => 'Government fee reimbursement and merit scholarship support available as per Andhra Pradesh state norms.',
                'fee_note' => 'Tuition & hostel fees follow Andhra Pradesh Regulatory Fee Fixation Committee guidelines.',
                'process_steps_json' => [
                    ['step' => '01', 'title' => 'Submit Enquiry', 'detail' => 'Share academic interest and contact details online.'],
                    ['step' => '02', 'title' => 'Counselling Call', 'detail' => 'Verify eligibility and AP EAPCET / Management quota pathway.'],
                    ['step' => '03', 'title' => 'Document Verification', 'detail' => 'Submit original certificates at Divili Campus Admissions Office.'],
                ],
            ]);
        }

        if (FormDefinition::count() === 0) {
            FormDefinition::create([
                'name' => 'Admissions Enquiry Form',
                'slug' => 'admission-enquiry',
                'description' => 'Primary student admission inquiry capture form.',
                'recipient_email' => $config['contactEmail'] ?? 'kitspharmacollege@gmail.com',
                'submit_label' => 'Submit Admission Enquiry',
                'success_message' => 'Thank you! Your admission enquiry has been recorded. Our Admissions Cell will contact you shortly.',
                'fields_json' => [
                    ['id' => 'f-1', 'label' => 'Student Name', 'type' => 'text', 'required' => true],
                    ['id' => 'f-2', 'label' => 'Mobile Number', 'type' => 'tel', 'required' => true],
                    ['id' => 'f-3', 'label' => 'Interested Program', 'type' => 'select', 'required' => true],
                ],
                'active' => true,
            ]);
        }

        if (SeoSetting::count() === 0) {
            SeoSetting::create([
                'site_title' => $config['websiteName'] ?? 'KITS College of Pharmacy for Women',
                'site_description' => 'Official website of KITS College of Pharmacy for Women, Divili, Peddapuram Mandal, Kakinada District, Andhra Pradesh.',
                'default_keywords' => 'KITS College of Pharmacy for Women, Divili Pharmacy College, B.Pharmacy Kakinada, Women Pharmacy College Andhra Pradesh, JNTUK Pharmacy',
                'favicon_url' => '',
                'default_og_image' => '/src/assets/images/hero_campus_building_1794818461158.jpg',
                'robots_index' => true,
                'enable_sitemap' => true,
                'enable_breadcrumbs' => true,
                'enable_structured_data' => true,
                'institution_type' => 'CollegeOrUniversity',
            ]);
        }

        $settings = [
            'general' => [
                'websiteName' => $config['websiteName'] ?? 'KITS College of Pharmacy for Women',
                'websiteUrl' => $config['websiteUrl'] ?? 'https://kitspharmacy.ac.in',
                'collegeName' => 'KITS College of Pharmacy for Women',
                'description' => 'PCI-approved women pharmacy institution affiliated to JNTU Kakinada at Divili, Andhra Pradesh.',
                'timezone' => 'Asia/Kolkata',
                'language' => 'English',
                'contactEmail' => $config['contactEmail'] ?? 'kitspharmacollege@gmail.com',
                'contactPhone' => $config['contactPhone'] ?? '+91 97015 18708',
            ],
            'branding' => [
                'mainLogo' => 'svg-emblem',
                'footerLogo' => 'svg-emblem',
                'mobileLogo' => 'svg-emblem',
                'favicon' => '',
                'loginLogo' => 'svg-emblem',
            ],
            'contact' => [
                'address' => 'Tirupati (V), Divili, Peddapuram Mandal, Kakinada District, Andhra Pradesh – 533433',
                'primaryPhone' => $config['contactPhone'] ?? '+91 97015 18708',
                'landlinePhone' => '08852 247550',
                'email' => $config['contactEmail'] ?? 'kitspharmacollege@gmail.com',
                'workingHours' => 'Mon – Sat: 9:30 AM – 4:30 PM',
                'whatsappNumber' => '+919701518708',
                'mapQuery' => 'KITS College of Pharmacy for Women Divili Peddapuram',
                'mapEmbedUrl' => '',
            ],
            'integrations' => [
                'googleAnalyticsId' => '',
                'searchConsoleVerification' => '',
                'googleMapsConfigured' => false,
                'whatsappEnabled' => true,
                'smtpHost' => '',
                'smtpPort' => '587',
                'aiProviderEndpoint' => '/api/v1/chatbot/message',
            ],
            'maintenance' => [
                'enabled' => false,
                'mode' => 'maintenance',
                'message' => 'Our website is undergoing scheduled academic updates. Please contact +91 97015 18708 for urgent admissions queries.',
            ],
        ];

        foreach ($settings as $group => $pairs) {
            foreach ($pairs as $key => $val) {
                SiteSetting::updateOrCreate(
                    ['group' => $group, 'key' => $key],
                    ['value' => is_bool($val) ? ($val ? '1' : '0') : (string) $val]
                );
            }
        }
    }
}
