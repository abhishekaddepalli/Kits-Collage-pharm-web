<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PageSection extends Model
{
    protected $fillable = [
        'page_id',
        'type',
        'title',
        'subtitle',
        'body',
        'image_url',
        'image_alt',
        'background',
        'padding_y',
        'hidden',
        'sort_order',
        'cta_label',
        'cta_link',
        'items_json',
    ];

    protected function casts(): array
    {
        return [
            'hidden' => 'boolean',
            'items_json' => 'array',
        ];
    }

    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }
}
