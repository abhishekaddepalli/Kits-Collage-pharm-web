<?php

use App\Http\Controllers\Api\V1\AdminAcademicsAndAdmissionsController;
use App\Http\Controllers\Api\V1\AdminCmsController;
use App\Http\Controllers\Api\V1\AdminSystemController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ChatbotPublicController;
use App\Http\Controllers\Api\V1\InstallController;
use App\Http\Controllers\Api\V1\PublicSiteController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // ------------------------------------------------------------------
    // 1. Installation Status & Wizard Routes (Locked Once Installed)
    // ------------------------------------------------------------------
    Route::get('/install/status', [InstallController::class, 'status']);

    Route::prefix('install')
        ->middleware(['not.installed', 'noindex.admin'])
        ->group(function () {
            Route::get('/requirements', [InstallController::class, 'requirements']);
            Route::post('/test-database', [InstallController::class, 'testDatabase']);
            Route::post('/execute', [InstallController::class, 'execute']);
        });

    // ------------------------------------------------------------------
    // 2. Public Institutional Website API (Requires Installed State)
    // ------------------------------------------------------------------
    Route::middleware(['installed'])->group(function () {
        Route::get('/public/bootstrap', [PublicSiteController::class, 'bootstrap']);
        Route::get('/public/pages/{slug}', [PublicSiteController::class, 'page']);
        Route::get('/public/departments/{slug}', [PublicSiteController::class, 'department']);
        Route::get('/public/news-events', [PublicSiteController::class, 'news']);

        Route::post('/public/enquiries', [PublicSiteController::class, 'submitEnquiry'])
            ->middleware('throttle:public-enquiry');
        Route::post('/public/feedback', [PublicSiteController::class, 'submitFeedback'])
            ->middleware('throttle:public-enquiry');

        Route::post('/chatbot/message', [ChatbotPublicController::class, 'respond'])
            ->middleware('throttle:chatbot');
    });

    // ------------------------------------------------------------------
    // 3. Authentication & Profile Routes (HTTP-only Cookie + CSRF)
    // ------------------------------------------------------------------
    Route::prefix('auth')
        ->middleware(['installed', 'noindex.admin'])
        ->group(function () {
            Route::get('/csrf', [AuthController::class, 'csrf']);
            Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
            Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:login');
            Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:login');

            Route::middleware('auth:sanctum')->group(function () {
                Route::get('/me', [AuthController::class, 'me']);
                Route::post('/logout', [AuthController::class, 'logout']);
                Route::put('/profile', [AuthController::class, 'updateProfile']);
                Route::put('/change-password', [AuthController::class, 'changePassword']);
            });
        });

    // ------------------------------------------------------------------
    // 4. Protected Admin CMS Routes (Sanctum Session + Server RBAC)
    // ------------------------------------------------------------------
    Route::prefix('admin')
        ->middleware(['installed', 'auth:sanctum', 'noindex.admin'])
        ->group(function () {
            Route::get('/bootstrap', [AdminCmsController::class, 'bootstrap']);
            Route::get('/dashboard', [AdminCmsController::class, 'dashboard']);

            Route::put('/appearance', [AdminCmsController::class, 'updateAppearance'])
                ->middleware('permission:appearance_management');

            Route::put('/header', [AdminCmsController::class, 'updateHeader'])
                ->middleware('permission:website_management');
            Route::put('/footer', [AdminCmsController::class, 'updateFooter'])
                ->middleware('permission:website_management');
            Route::put('/menus', [AdminCmsController::class, 'syncNavigation'])
                ->middleware('permission:website_management');
            Route::put('/sliders', [AdminCmsController::class, 'syncSliders'])
                ->middleware('permission:website_management');
            Route::put('/banners', [AdminCmsController::class, 'syncBanners'])
                ->middleware('permission:website_management');
            Route::post('/media', [AdminCmsController::class, 'uploadMedia'])
                ->middleware('permission:website_management');
            Route::put('/media/{id}', [AdminCmsController::class, 'updateMedia'])
                ->middleware('permission:website_management');
            Route::delete('/media/{id}', [AdminCmsController::class, 'destroyMedia'])
                ->middleware('permission:website_management');

            Route::post('/pages', [AdminCmsController::class, 'storePage'])
                ->middleware('permission:page_management');
            Route::put('/pages/{id}', [AdminCmsController::class, 'updatePage'])
                ->middleware('permission:page_management');
            Route::delete('/pages/{id}', [AdminCmsController::class, 'destroyPage'])
                ->middleware('permission:page_management');

            Route::put('/programs', [AdminAcademicsAndAdmissionsController::class, 'syncPrograms'])
                ->middleware('permission:academic_content');
            Route::put('/departments', [AdminAcademicsAndAdmissionsController::class, 'syncDepartments'])
                ->middleware('permission:academic_content');
            Route::put('/faculty', [AdminAcademicsAndAdmissionsController::class, 'syncFaculty'])
                ->middleware('permission:academic_content');

            Route::put('/admissions-settings', [AdminAcademicsAndAdmissionsController::class, 'updateAdmissionsSettings'])
                ->middleware('permission:admissions');
            Route::get('/enquiries', [AdminAcademicsAndAdmissionsController::class, 'listEnquiries'])
                ->middleware('permission:admissions');
            Route::put('/enquiries/{id}', [AdminAcademicsAndAdmissionsController::class, 'updateEnquiry'])
                ->middleware('permission:admissions');
            Route::get('/enquiries/export', [AdminAcademicsAndAdmissionsController::class, 'exportEnquiries'])
                ->middleware('permission:admissions');

            Route::put('/news-events', [AdminAcademicsAndAdmissionsController::class, 'syncNewsEvents'])
                ->middleware('permission:news');
            Route::put('/modules/{module}', [AdminAcademicsAndAdmissionsController::class, 'syncContentModule'])
                ->middleware('permission:academic_content,news');

            Route::put('/chatbot/settings', [AdminSystemController::class, 'updateChatbotSettings'])
                ->middleware('permission:chatbot');
            Route::put('/chatbot/faqs', [AdminSystemController::class, 'syncChatbotFaqs'])
                ->middleware('permission:chatbot');

            Route::put('/seo', [AdminSystemController::class, 'updateSeo'])
                ->middleware('permission:website_management');
            Route::put('/settings', [AdminSystemController::class, 'updateSettings'])
                ->middleware('permission:system_settings,website_management');
            Route::put('/forms', [AdminSystemController::class, 'syncForms'])
                ->middleware('permission:website_management');

            Route::post('/users', [AdminSystemController::class, 'storeUser'])
                ->middleware('permission:user_management');
            Route::put('/users/{id}', [AdminSystemController::class, 'updateUser'])
                ->middleware('permission:user_management');
            Route::delete('/users/{id}', [AdminSystemController::class, 'destroyUser'])
                ->middleware('permission:user_management');
            Route::put('/roles/{id}', [AdminSystemController::class, 'updateRolePermissions'])
                ->middleware('permission:user_management');

            Route::post('/notifications/read-all', [AdminSystemController::class, 'markAllNotificationsRead']);
            Route::get('/install-info', [AdminSystemController::class, 'installInfo'])
                ->middleware('permission:system_settings');
        });
});
