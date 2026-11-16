<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('admission_campaigns', function (Blueprint $table) {
            $table->id();
            $table->string('academic_year', 40);
            $table->boolean('admissions_open')->default(true);
            $table->string('headline');
            $table->text('subtext')->nullable();
            $table->json('important_dates_json')->nullable();
            $table->text('scholarship_note')->nullable();
            $table->text('fee_note')->nullable();
            $table->json('process_steps_json')->nullable();
            $table->timestamps();
        });

        Schema::create('admission_enquiries', function (Blueprint $table) {
            $table->id();
            $table->string('reference_code', 40)->unique();
            $table->foreignId('campaign_id')->nullable()->constrained('admission_campaigns')->nullOnDelete();
            $table->string('student_name');
            $table->string('parent_name')->nullable();
            $table->string('mobile', 30);
            $table->string('email')->nullable();
            $table->string('interested_program', 160);
            $table->string('qualification', 160)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->text('message')->nullable();
            $table->enum('status', ['New', 'Contacted', 'Interested', 'Follow-up', 'Converted', 'Not Interested'])
                ->default('New')
                ->index();
            $table->date('follow_up_date')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
        });

        Schema::create('enquiry_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enquiry_id')->constrained('admission_enquiries')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('note');
            $table->timestamps();
        });

        Schema::create('enquiry_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enquiry_id')->constrained('admission_enquiries')->cascadeOnDelete();
            $table->foreignId('assigned_to_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('assigned_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamps();
        });

        Schema::create('news_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 80);
            $table->string('slug', 80)->unique();
            $table->timestamps();
        });

        Schema::create('news', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('news_categories')->nullOnDelete();
            $table->enum('type', ['news', 'announcement'])->default('news');
            $table->string('title');
            $table->string('slug', 160)->unique();
            $table->text('excerpt')->nullable();
            $table->longText('content')->nullable();
            $table->string('featured_image', 500)->nullable();
            $table->string('image_alt')->nullable();
            $table->string('author', 120)->nullable();
            $table->enum('status', ['published', 'draft', 'scheduled'])->default('published')->index();
            $table->date('published_at')->nullable();
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->timestamps();
        });

        Schema::create('event_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 80);
            $table->string('slug', 80)->unique();
            $table->timestamps();
        });

        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('event_categories')->nullOnDelete();
            $table->string('title');
            $table->string('slug', 160)->unique();
            $table->text('excerpt')->nullable();
            $table->longText('content')->nullable();
            $table->string('featured_image', 500)->nullable();
            $table->string('image_alt')->nullable();
            $table->date('event_date')->nullable()->index();
            $table->string('venue')->nullable();
            $table->string('author', 120)->nullable();
            $table->enum('status', ['published', 'draft', 'scheduled'])->default('published')->index();
            $table->date('published_at')->nullable();
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
        Schema::dropIfExists('event_categories');
        Schema::dropIfExists('news');
        Schema::dropIfExists('news_categories');
        Schema::dropIfExists('enquiry_assignments');
        Schema::dropIfExists('enquiry_notes');
        Schema::dropIfExists('admission_enquiries');
        Schema::dropIfExists('admission_campaigns');
    }
};
