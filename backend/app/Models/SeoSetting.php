<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SeoSetting extends Model
{
    protected $fillable = [
        'site_title', 'site_description', 'default_keywords', 'favicon_url', 'default_og_image',
        'robots_index', 'enable_sitemap', 'enable_breadcrumbs', 'enable_structured_data', 'institution_type',
    ];

    protected function casts(): array
    {
        return [
            'robots_index' => 'boolean',
            'enable_sitemap' => 'boolean',
            'enable_breadcrumbs' => 'boolean',
            'enable_structured_data' => 'boolean',
        ];
    }
}
