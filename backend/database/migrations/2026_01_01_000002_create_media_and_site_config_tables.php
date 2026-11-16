<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('media_folders', function (Blueprint $table) {
            $table->id();
            $table->string('name', 80);
            $table->string('slug', 80)->unique();
            $table->timestamps();
        });

        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('folder_id')->nullable()->constrained('media_folders')->nullOnDelete();
            $table->string('folder_name', 80)->default('Campus')->index();
            $table->string('title');
            $table->string('alt_text')->nullable();
            $table->enum('type', ['image', 'video', 'pdf', 'brochure'])->default('image')->index();
            $table->string('disk_path', 500)->nullable();
            $table->string('public_url', 500);
            $table->string('mime_type', 120)->nullable();
            $table->unsignedBigInteger('file_size_bytes')->default(0);
            $table->string('file_size_label', 40)->default('0 KB');
            $table->string('dimensions', 40)->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('group', 60)->index();
            $table->string('key', 100);
            $table->longText('value')->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['group', 'key']);
        });

        Schema::create('themes', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 80)->unique();
            $table->string('name', 120);
            $table->boolean('is_preset')->default(false);
            $table->boolean('is_active')->default(false)->index();
            $table->json('palette_json');
            $table->timestamps();
        });

        Schema::create('theme_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('theme_id')->constrained('themes')->cascadeOnDelete();
            $table->json('typography_json');
            $table->json('layout_json');
            $table->longText('custom_css')->nullable();
            $table->timestamps();
        });

        Schema::create('header_settings', function (Blueprint $table) {
            $table->id();
            $table->string('college_name');
            $table->string('college_subtitle');
            $table->string('location_short')->nullable();
            $table->string('affiliation_text')->nullable();
            $table->string('approval_text')->nullable();
            $table->string('phone', 40)->nullable();
            $table->string('secondary_phone', 40)->nullable();
            $table->string('email')->nullable();
            $table->string('working_hours', 120)->nullable();
            $table->string('announcement_text', 500)->nullable();
            $table->string('announcement_link', 300)->nullable();
            $table->boolean('show_announcement')->default(true);
            $table->string('exam_portal_label', 80)->nullable();
            $table->string('exam_portal_url', 300)->nullable();
            $table->string('student_portal_label', 80)->nullable();
            $table->string('student_portal_url', 300)->nullable();
            $table->string('default_language', 40)->default('English');
            $table->string('apply_button_label', 80)->default('Apply Now');
            $table->string('apply_button_path', 200)->default('/admissions');
            $table->foreignId('logo_media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->string('logo_url', 500)->nullable();
            $table->string('header_bg', 20)->default('#FFFFFF');
            $table->string('header_text_color', 20)->default('#171238');
            $table->string('nav_bg', 20)->default('#32105B');
            $table->string('nav_text_color', 20)->default('#FFFFFF');
            $table->boolean('sticky')->default(true);
            $table->timestamps();
        });

        Schema::create('footer_settings', function (Blueprint $table) {
            $table->id();
            $table->string('logo_url', 500)->nullable();
            $table->text('intro_text')->nullable();
            $table->text('address')->nullable();
            $table->string('phone', 40)->nullable();
            $table->string('email')->nullable();
            $table->string('copyright_text', 300)->nullable();
            $table->string('background_color', 20)->default('#171238');
            $table->string('text_color', 20)->default('#F5F0FC');
            $table->json('columns_json')->nullable();
            $table->string('custom_block_title')->nullable();
            $table->text('custom_block_content')->nullable();
            $table->timestamps();
        });

        Schema::create('social_links', function (Blueprint $table) {
            $table->id();
            $table->string('platform', 40)->unique();
            $table->string('url', 500)->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_links');
        Schema::dropIfExists('footer_settings');
        Schema::dropIfExists('header_settings');
        Schema::dropIfExists('theme_settings');
        Schema::dropIfExists('themes');
        Schema::dropIfExists('site_settings');
        Schema::dropIfExists('media');
        Schema::dropIfExists('media_folders');
    }
};
