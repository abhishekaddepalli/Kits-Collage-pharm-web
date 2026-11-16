<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code', 40);
            $table->enum('level', ['UG', 'PG', 'Diploma'])->default('UG');
            $table->string('qualification')->nullable();
            $table->string('duration', 80);
            $table->text('eligibility')->nullable();
            $table->longText('description')->nullable();
            $table->string('intake_capacity', 80)->nullable();
            $table->text('admission_info')->nullable();
            $table->string('brochure_url', 500)->nullable();
            $table->string('verification_status', 40)->default('verified');
            $table->boolean('active')->default(true)->index();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 120)->unique();
            $table->string('name');
            $table->text('short_description')->nullable();
            $table->longText('introduction')->nullable();
            $table->string('icon_name', 60)->default('FlaskConical');
            $table->string('image_url', 500)->nullable();
            $table->string('image_alt')->nullable();
            $table->json('facilities_json')->nullable();
            $table->json('laboratories_json')->nullable();
            $table->json('research_areas_json')->nullable();
            $table->json('publications_json')->nullable();
            $table->string('verification_status', 40)->default('verified');
            $table->boolean('active')->default(true)->index();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('faculty', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('photo_url', 500)->nullable();
            $table->string('photo_alt')->nullable();
            $table->string('designation', 120);
            $table->string('qualification', 160);
            $table->string('experience', 80)->nullable();
            $table->longText('biography')->nullable();
            $table->string('email')->nullable();
            $table->json('research_interests_json')->nullable();
            $table->unsignedInteger('publications_count')->default(0);
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('active')->default(true)->index();
            $table->string('verification_status', 40)->default('verified');
            $table->timestamps();
        });

        Schema::create('faculty_departments', function (Blueprint $table) {
            $table->foreignId('faculty_id')->constrained('faculty')->cascadeOnDelete();
            $table->foreignId('department_id')->constrained('departments')->cascadeOnDelete();
            $table->boolean('is_head')->default(false);
            $table->primary(['faculty_id', 'department_id']);
        });

        Schema::create('academic_calendars', function (Blueprint $table) {
            $table->id();
            $table->string('academic_year', 40);
            $table->string('title');
            $table->string('semester', 60)->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('document_url', 500)->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('academic_documents', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('category', 80)->index();
            $table->string('file_url', 500);
            $table->string('file_size', 40)->nullable();
            $table->date('published_date')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_documents');
        Schema::dropIfExists('academic_calendars');
        Schema::dropIfExists('faculty_departments');
        Schema::dropIfExists('faculty');
        Schema::dropIfExists('departments');
        Schema::dropIfExists('programs');
    }
};
