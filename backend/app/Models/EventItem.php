<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventItem extends Model
{
    protected $table = 'events';

    protected $fillable = [
        'category_id', 'title', 'slug', 'excerpt', 'content', 'featured_image', 'image_alt',
        'event_date', 'venue', 'author', 'status', 'published_at', 'seo_title', 'seo_description',
    ];

    protected function casts(): array
    {
        return [
            'event_date' => 'date:Y-m-d',
            'published_at' => 'date:Y-m-d',
        ];
    }
}
