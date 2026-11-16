<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Faculty extends Model
{
    protected $table = 'faculty';

    protected $fillable = [
        'name',
        'photo_url',
        'photo_alt',
        'designation',
        'qualification',
        'experience',
        'biography',
        'email',
        'research_interests_json',
        'publications_count',
        'sort_order',
        'active',
        'verification_status',
    ];

    protected function casts(): array
    {
        return [
            'research_interests_json' => 'array',
            'active' => 'boolean',
        ];
    }

    public function departments(): BelongsToMany
    {
        return $this->belongsToMany(Department::class, 'faculty_departments')->withPivot('is_head');
    }
}
