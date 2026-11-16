# Normalized MySQL 8.0+ Database Schema — KITS Pharmacy CMS

Engine: **InnoDB** | Charset: **utf8mb4** | Collation: **utf8mb4_unicode_ci**  
No binary file BLOBs are stored in MySQL; uploaded files reside on disk under `storage/app/public/uploads/` with path references stored in `media`.

---

## 1. Website Configuration & Theme
1. **`site_settings`**: `id`, `group` (`general`, `branding`, `contact`, `integrations`, `maintenance`, `admissions`), `key`, `value` (longText/JSON), `updated_by`, `timestamps` (unique index on `group, key`).
2. **`themes`**: `id`, `slug` (unique), `name`, `is_preset` (bool), `is_active` (bool), `palette_json` (16 semantic hex colors), `timestamps`.
3. **`theme_settings`**: `id`, `theme_id` (FK -> `themes.id` cascade), `typography_json`, `layout_json`, `custom_css`, `timestamps`.
4. **`header_settings`**: `id`, `college_name`, `college_subtitle`, `location_short`, `affiliation_text`, `approval_text`, `phone`, `secondary_phone`, `email`, `working_hours`, `announcement_text`, `announcement_link`, `show_announcement`, `exam_portal_label`, `exam_portal_url`, `student_portal_label`, `student_portal_url`, `default_language`, `apply_button_label`, `apply_button_path`, `logo_media_id` (nullable FK -> `media.id` nullOnDelete), `logo_url`, `header_bg`, `header_text_color`, `nav_bg`, `nav_text_color`, `sticky`, `timestamps`.
5. **`footer_settings`**: `id`, `logo_url`, `intro_text`, `address`, `phone`, `email`, `copyright_text`, `background_color`, `text_color`, `columns_json`, `custom_block_title`, `custom_block_content`, `timestamps`.
6. **`social_links`**: `id`, `platform`, `url`, `sort_order`, `is_active`, `timestamps`.

## 2. Authentication & RBAC
7. **`users`**: `id`, `name`, `username` (unique), `email` (unique), `password` (bcrypt/argon2id hash), `is_active` (bool), `last_login_at`, `last_login_ip`, `remember_token`, `timestamps`.
8. **`roles`**: `id`, `name` (unique), `slug` (unique), `description`, `timestamps`.
9. **`permissions`**: `id`, `key` (unique), `label`, `module`, `timestamps`.
10. **`role_permissions`**: `role_id` (FK cascade), `permission_id` (FK cascade), composite PK.
11. **`user_roles`**: `user_id` (FK cascade), `role_id` (FK cascade), composite PK.
12. **`password_reset_tokens`**: `email` (PK), `token`, `created_at`.
13. **`sessions`**: `id` (PK), `user_id` (nullable index), `ip_address`, `user_agent`, `payload`, `last_activity` (index).

## 3. Navigation
14. **`menus`**: `id`, `location` (`primary`, `footer`, `topbar`), `name`, `slug` (unique), `timestamps`.
15. **`menu_items`**: `id`, `menu_id` (FK cascade), `parent_id` (nullable self-FK cascade), `label`, `path`, `sort_order`, `enabled`, `open_in_new_tab`, `timestamps`.

## 4. CMS Pages & Builder
16. **`page_categories`**: `id`, `name`, `slug` (unique), `timestamps`.
17. **`pages`**: `id`, `category_id` (nullable FK nullOnDelete), `title`, `slug` (unique), `status` (`published`, `draft`, `scheduled`), `scheduled_at`, `enabled`, `is_system_route`, `seo_title`, `seo_description`, `updated_by` (nullable FK nullOnDelete), `timestamps`.
18. **`page_sections`**: `id`, `page_id` (FK cascade), `type`, `title`, `subtitle`, `body`, `image_url`, `image_alt`, `background`, `padding_y`, `hidden`, `sort_order`, `cta_label`, `cta_link`, `items_json`, `timestamps`.
19. **`page_revisions`**: `id`, `page_id` (FK cascade), `snapshot_json`, `created_by` (nullable FK nullOnDelete), `created_at`.

## 5. Media Library
20. **`media_folders`**: `id`, `name`, `slug` (unique), `timestamps`.
21. **`media`**: `id`, `folder_id` (nullable FK nullOnDelete), `folder_name`, `title`, `alt_text`, `type` (`image`, `video`, `pdf`, `brochure`), `disk_path`, `public_url`, `mime_type`, `file_size_bytes`, `file_size_label`, `dimensions`, `uploaded_by` (nullable FK nullOnDelete), `timestamps`.

## 6. Sliders & Banners
22. **`sliders`**: `id`, `name`, `slug` (unique), `is_active`, `timestamps`.
23. **`slider_items`**: `id`, `slider_id` (FK cascade), `badge`, `heading`, `highlighted_text`, `subheading`, `description`, `desktop_image`, `mobile_image`, `image_alt`, `primary_cta_label`, `primary_cta_link`, `secondary_cta_label`, `secondary_cta_link`, `overlay_opacity`, `text_position`, `animation`, `duration_ms`, `sort_order`, `active`, `start_date`, `end_date`, `video_url`, `timestamps`.
24. **`banners`**: `id`, `title`, `subtitle`, `cta_label`, `cta_link`, `image_url`, `placement`, `active`, `timestamps`.

## 7. Academic Content
25. **`programs`**: `id`, `name`, `code`, `level`, `qualification`, `duration`, `eligibility`, `description`, `intake_capacity`, `admission_info`, `brochure_url`, `verification_status`, `active`, `sort_order`, `timestamps`.
26. **`departments`**: `id`, `slug` (unique), `name`, `short_description`, `introduction`, `icon_name`, `image_url`, `image_alt`, `facilities_json`, `laboratories_json`, `research_areas_json`, `publications_json`, `verification_status`, `active`, `sort_order`, `timestamps`.
27. **`faculty`**: `id`, `name`, `photo_url`, `photo_alt`, `designation`, `qualification`, `experience`, `biography`, `email`, `research_interests_json`, `publications_count`, `sort_order`, `active`, `verification_status`, `timestamps`.
28. **`faculty_departments`**: `faculty_id` (FK cascade), `department_id` (FK cascade), `is_head` (bool), composite PK.
29. **`academic_calendars`**: `id`, `academic_year`, `title`, `semester`, `start_date`, `end_date`, `document_url`, `active`, `timestamps`.
30. **`academic_documents`**: `id`, `title`, `category`, `file_url`, `file_size`, `published_date`, `active`, `timestamps`.

## 8. Institutional Content & Gallery
31. **`achievements`**: `id`, `category`, `title`, `recipient`, `year`, `description`, `image_url`, `verification_status`, `active`, `timestamps`.
32. **`placements`**: `id`, `company_name`, `sector`, `role_title`, `year`, `notes`, `verification_status`, `active`, `timestamps`.
33. **`campus_facilities`**: `id`, `slug` (unique), `title`, `category`, `summary`, `details`, `highlights_json`, `image_url`, `image_alt`, `active`, `sort_order`, `timestamps`.
34. **`testimonials`**: `id`, `student_name`, `photo_url`, `course`, `graduation_year`, `quote`, `verification_status`, `active`, `timestamps`.
35. **`gallery_categories`**: `id`, `name`, `slug` (unique), `timestamps`.
36. **`gallery_items`**: `id`, `category_id` (nullable FK nullOnDelete), `category_name`, `title`, `media_type` (`photo`, `video`), `url`, `youtube_id`, `alt_text`, `captured_date`, `active`, `timestamps`.

## 9. Admissions & Enquiries
37. **`admission_campaigns`**: `id`, `academic_year`, `admissions_open`, `headline`, `subtext`, `important_dates_json`, `scholarship_note`, `fee_note`, `process_steps_json`, `timestamps`.
38. **`admission_enquiries`**: `id`, `reference_code` (unique), `campaign_id` (nullable FK nullOnDelete), `student_name`, `parent_name`, `mobile`, `email`, `interested_program`, `qualification`, `city`, `state`, `message`, `status` (index), `follow_up_date`, `ip_address`, `timestamps`.
39. **`enquiry_notes`**: `id`, `enquiry_id` (FK cascade), `user_id` (nullable FK nullOnDelete), `note`, `timestamps`.
40. **`enquiry_assignments`**: `id`, `enquiry_id` (FK cascade), `assigned_to_user_id` (nullable FK nullOnDelete), `assigned_by_user_id` (nullable FK nullOnDelete), `assigned_at`, `timestamps`.

## 10. News & Events
41. **`news_categories`**: `id`, `name`, `slug` (unique), `timestamps`.
42. **`news`**: `id`, `category_id` (nullable FK nullOnDelete), `type` (`news`, `announcement`), `title`, `slug` (unique), `excerpt`, `content`, `featured_image`, `image_alt`, `author`, `status` (index), `published_at`, `seo_title`, `seo_description`, `timestamps`.
43. **`event_categories`**: `id`, `name`, `slug` (unique), `timestamps`.
44. **`events`**: `id`, `category_id` (nullable FK nullOnDelete), `title`, `slug` (unique), `excerpt`, `content`, `featured_image`, `image_alt`, `event_date` (index), `venue`, `author`, `status`, `published_at`, `seo_title`, `seo_description`, `timestamps`.

## 11. Chatbot
45. **`chatbot_settings`**: `id`, `enabled`, `name`, `avatar_url`, `welcome_message`, `primary_color`, `suggested_questions_json`, `fallback_message`, `ai_enabled`, `ai_model`, `retention_days`, `timestamps`.
46. **`chatbot_categories`**: `id`, `name` (unique), `slug` (unique), `timestamps`.
47. **`chatbot_faqs`**: `id`, `category_id` (nullable FK nullOnDelete), `category_name`, `question`, `answer`, `enabled`, `sort_order`, `timestamps`.
48. **`chatbot_keywords`**: `id`, `faq_id` (FK cascade), `keyword` (index).
49. **`chatbot_conversations`**: `id`, `session_token` (index), `visitor_ip_hash`, `started_at`, `last_message_at`, `timestamps`.
50. **`chatbot_messages`**: `id`, `conversation_id` (FK cascade), `sender` (`user`, `bot`), `message_text`, `matched_faq_id` (nullable FK nullOnDelete), `provider` (`faq`, `gemini`, `fallback`), `matched` (bool), `created_at`.

## 12. Administration, Forms & SEO
51. **`forms`**: `id`, `name`, `slug` (unique), `description`, `recipient_email`, `submit_label`, `success_message`, `fields_json`, `active`, `timestamps`.
52. **`form_submissions`**: `id`, `form_id` (FK cascade), `payload_json`, `ip_address`, `created_at`.
53. **`notifications`**: `id`, `user_id` (nullable FK cascade), `title`, `message`, `type`, `is_read` (index), `link`, `timestamps`.
54. **`activity_logs`**: `id`, `user_id` (nullable FK nullOnDelete), `actor_name`, `actor_role`, `action`, `module`, `ip_address`, `created_at` (index).
55. **`system_logs`**: `id`, `level`, `channel`, `message`, `context_json`, `created_at` (index).
56. **`installation_status`**: `id`, `is_installed` (bool), `app_version`, `admin_path`, `installed_at`, `installed_by_email`, `timestamps`.
57. **`seo_settings`**: `id`, `site_title`, `site_description`, `default_keywords`, `favicon_url`, `default_og_image`, `robots_index`, `enable_sitemap`, `enable_breadcrumbs`, `enable_structured_data`, `institution_type`, `timestamps`.
58. **`page_seo`**: `id`, `page_id` (FK cascade), `canonical_url`, `og_title`, `og_description`, `og_image`, `no_index`, `schema_json`, `timestamps`.
