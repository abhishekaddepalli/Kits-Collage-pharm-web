<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Department extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'short_description',
        'introduction',
        'icon_name',
        'image_url',
        'image_alt',
        'facilities_json',
        'laboratories_json',
        'research_areas_json',
        'publications_json',
        'verification_status',
        'active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'facilities_json' => 'array',
            'laboratories_json' => 'array',
            'research_areas_json' => 'array',
            'publications_json' => 'array',
            'active' => 'boolean',
        ];
    }

    public function faculty(): BelongsToMany
    {
        return $this->belongsToMany(Faculty::class, 'faculty_departments')->withPivot('is_head');
    }
}
