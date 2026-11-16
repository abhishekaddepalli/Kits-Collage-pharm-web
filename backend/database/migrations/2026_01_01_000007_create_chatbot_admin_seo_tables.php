<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('chatbot_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('enabled')->default(true);
            $table->string('name', 120)->default('KITS AI Assistant');
            $table->string('avatar_url', 500)->nullable();
            $table->text('welcome_message')->nullable();
            $table->string('primary_color', 20)->default('#52128B');
            $table->json('suggested_questions_json')->nullable();
            $table->text('fallback_message')->nullable();
            $table->boolean('ai_enabled')->default(false);
            $table->string('ai_model', 80)->default('gemini-4-hydrogen');
            $table->unsignedInteger('retention_days')->default(90);
            $table->timestamps();
        });

        Schema::create('chatbot_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 80)->unique();
            $table->string('slug', 80)->unique();
            $table->timestamps();
        });

        Schema::create('chatbot_faqs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('chatbot_categories')->nullOnDelete();
            $table->string('category_name', 80)->default('College Information');
            $table->string('question', 500);
            $table->text('answer');
            $table->boolean('enabled')->default(true)->index();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('chatbot_keywords', function (Blueprint $table) {
            $table->id();
            $table->foreignId('faq_id')->constrained('chatbot_faqs')->cascadeOnDelete();
            $table->string('keyword', 80)->index();
        });

        Schema::create('chatbot_conversations', function (Blueprint $table) {
            $table->id();
            $table->string('session_token', 100)->index();
            $table->string('visitor_ip_hash', 64)->nullable();
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('last_message_at')->useCurrent();
            $table->timestamps();
        });

        Schema::create('chatbot_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('chatbot_conversations')->cascadeOnDelete();
            $table->enum('sender', ['user', 'bot']);
            $table->text('message_text');
            $table->foreignId('matched_faq_id')->nullable()->constrained('chatbot_faqs')->nullOnDelete();
            $table->enum('provider', ['faq', 'gemini', 'fallback'])->default('faq');
            $table->boolean('matched')->default(true);
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('forms', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('slug', 80)->unique();
            $table->text('description')->nullable();
            $table->string('recipient_email')->nullable();
            $table->string('submit_label', 80)->default('Submit');
            $table->text('success_message')->nullable();
            $table->json('fields_json')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('form_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_id')->constrained('forms')->cascadeOnDelete();
            $table->json('payload_json');
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('message');
            $table->enum('type', ['enquiry', 'system', 'content'])->default('system');
            $table->boolean('is_read')->default(false)->index();
            $table->string('link', 200)->nullable();
            $table->timestamps();
        });

        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('actor_name', 120);
            $table->string('actor_role', 80);
            $table->string('action', 300);
            $table->string('module', 60)->index();
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent()->index();
        });

        Schema::create('system_logs', function (Blueprint $table) {
            $table->id();
            $table->string('level', 20)->default('info')->index();
            $table->string('channel', 60)->default('application');
            $table->text('message');
            $table->json('context_json')->nullable();
            $table->timestamp('created_at')->useCurrent()->index();
        });

        Schema::create('installation_status', function (Blueprint $table) {
            $table->id();
            $table->boolean('is_installed')->default(false);
            $table->string('app_version', 30)->default('2.0.0');
            $table->string('admin_login_path', 80)->default('/admin-login');
            $table->string('admin_panel_path', 80)->default('/control-panel');
            $table->timestamp('installed_at')->nullable();
            $table->string('installed_by_email')->nullable();
            $table->timestamps();
        });

        Schema::create('seo_settings', function (Blueprint $table) {
            $table->id();
            $table->string('site_title');
            $table->text('site_description')->nullable();
            $table->text('default_keywords')->nullable();
            $table->string('favicon_url', 500)->nullable();
            $table->string('default_og_image', 500)->nullable();
            $table->boolean('robots_index')->default(true);
            $table->boolean('enable_sitemap')->default(true);
            $table->boolean('enable_breadcrumbs')->default(true);
            $table->boolean('enable_structured_data')->default(true);
            $table->string('institution_type', 80)->default('CollegeOrUniversity');
            $table->timestamps();
        });

        Schema::create('page_seo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('page_id')->constrained('pages')->cascadeOnDelete();
            $table->string('canonical_url', 500)->nullable();
            $table->string('og_title')->nullable();
            $table->text('og_description')->nullable();
            $table->string('og_image', 500)->nullable();
            $table->boolean('no_index')->default(false);
            $table->json('schema_json')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_seo');
        Schema::dropIfExists('seo_settings');
        Schema::dropIfExists('installation_status');
        Schema::dropIfExists('system_logs');
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('form_submissions');
        Schema::dropIfExists('forms');
        Schema::dropIfExists('chatbot_messages');
        Schema::dropIfExists('chatbot_conversations');
        Schema::dropIfExists('chatbot_keywords');
        Schema::dropIfExists('chatbot_faqs');
        Schema::dropIfExists('chatbot_categories');
        Schema::dropIfExists('chatbot_settings');
    }
};
