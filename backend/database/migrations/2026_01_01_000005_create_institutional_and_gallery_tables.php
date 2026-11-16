<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->enum('category', ['Student', 'Faculty', 'Institutional', 'Research'])->default('Institutional');
            $table->string('title');
            $table->string('recipient')->nullable();
            $table->string('year', 20);
            $table->text('description')->nullable();
            $table->string('image_url', 500)->nullable();
            $table->string('verification_status', 40)->default('verified');
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('placements', function (Blueprint $table) {
            $table->id();
            $table->string('company_name');
            $table->string('sector', 120);
            $table->string('role_title', 160);
            $table->string('year', 20);
            $table->text('notes')->nullable();
            $table->string('verification_status', 40)->default('verified');
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('campus_facilities', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 120)->unique();
            $table->string('title');
            $table->string('category', 80);
            $table->text('summary')->nullable();
            $table->longText('details')->nullable();
            $table->json('highlights_json')->nullable();
            $table->string('image_url', 500)->nullable();
            $table->string('image_alt')->nullable();
            $table->boolean('active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->string('student_name');
            $table->string('photo_url', 500)->nullable();
            $table->string('course', 120);
            $table->string('graduation_year', 20);
            $table->text('quote');
            $table->string('verification_status', 40)->default('verified');
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('gallery_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 80)->unique();
            $table->string('slug', 80)->unique();
            $table->timestamps();
        });

        Schema::create('gallery_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('gallery_categories')->nullOnDelete();
            $table->string('category_name', 60)->default('Campus')->index();
            $table->string('title');
            $table->enum('media_type', ['photo', 'video'])->default('photo');
            $table->string('url', 500);
            $table->string('youtube_id', 80)->nullable();
            $table->string('alt_text')->nullable();
            $table->date('captured_date')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gallery_items');
        Schema::dropIfExists('gallery_categories');
        Schema::dropIfExists('testimonials');
        Schema::dropIfExists('campus_facilities');
        Schema::dropIfExists('placements');
        Schema::dropIfExists('achievements');
    }
};
