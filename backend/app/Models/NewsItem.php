<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NewsItem extends Model
{
    protected $table = 'news';

    protected $fillable = [
        'category_id', 'type', 'title', 'slug', 'excerpt', 'content',
        'featured_image', 'image_alt', 'author', 'status', 'published_at', 'seo_title', 'seo_description',
    ];

    protected function casts(): array
    {
        return ['published_at' => 'date:Y-m-d'];
    }
}
