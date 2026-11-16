<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->string('location', 40)->index();
            $table->string('name', 100);
            $table->string('slug', 80)->unique();
            $table->timestamps();
        });

        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_id')->constrained('menus')->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('menu_items')->cascadeOnDelete();
            $table->string('label', 120);
            $table->string('path', 300);
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('enabled')->default(true);
            $table->boolean('open_in_new_tab')->default(false);
            $table->timestamps();
        });

        Schema::create('page_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 100)->unique();
            $table->timestamps();
        });

        Schema::create('pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->nullable()->constrained('page_categories')->nullOnDelete();
            $table->string('title');
            $table->string('slug', 160)->unique();
            $table->enum('status', ['published', 'draft', 'scheduled'])->default('published')->index();
            $table->timestamp('scheduled_at')->nullable();
            $table->boolean('enabled')->default(true)->index();
            $table->boolean('is_system_route')->default(false);
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('page_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('page_id')->constrained('pages')->cascadeOnDelete();
            $table->string('type', 40);
            $table->string('title')->nullable();
            $table->string('subtitle')->nullable();
            $table->longText('body')->nullable();
            $table->string('image_url', 500)->nullable();
            $table->string('image_alt')->nullable();
            $table->string('background', 30)->default('default');
            $table->string('padding_y', 10)->default('md');
            $table->boolean('hidden')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('cta_label', 120)->nullable();
            $table->string('cta_link', 300)->nullable();
            $table->json('items_json')->nullable();
            $table->timestamps();
        });

        Schema::create('page_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('page_id')->constrained('pages')->cascadeOnDelete();
            $table->longText('snapshot_json');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('sliders', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('slug', 80)->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('slider_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('slider_id')->constrained('sliders')->cascadeOnDelete();
            $table->string('badge')->nullable();
            $table->string('heading');
            $table->string('highlighted_text')->nullable();
            $table->string('subheading')->nullable();
            $table->text('description')->nullable();
            $table->string('desktop_image', 500);
            $table->string('mobile_image', 500)->nullable();
            $table->string('image_alt')->nullable();
            $table->string('primary_cta_label', 80)->nullable();
            $table->string('primary_cta_link', 300)->nullable();
            $table->string('secondary_cta_label', 80)->nullable();
            $table->string('secondary_cta_link', 300)->nullable();
            $table->decimal('overlay_opacity', 4, 2)->default(0.45);
            $table->enum('text_position', ['left', 'center'])->default('left');
            $table->enum('animation', ['fade', 'slide'])->default('fade');
            $table->unsignedInteger('duration_ms')->default(6000);
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('active')->default(true)->index();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('video_url', 500)->nullable();
            $table->timestamps();
        });

        Schema::create('banners', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->string('cta_label', 80)->nullable();
            $table->string('cta_link', 300)->nullable();
            $table->string('image_url', 500)->nullable();
            $table->enum('placement', ['homepage', 'admissions', 'academics'])->default('homepage');
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('banners');
        Schema::dropIfExists('slider_items');
        Schema::dropIfExists('sliders');
        Schema::dropIfExists('page_revisions');
        Schema::dropIfExists('page_sections');
        Schema::dropIfExists('pages');
        Schema::dropIfExists('page_categories');
        Schema::dropIfExists('menu_items');
        Schema::dropIfExists('menus');
    }
};
