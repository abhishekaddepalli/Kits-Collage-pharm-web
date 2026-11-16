<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GalleryItem extends Model
{
    protected $fillable = ['category_id', 'category_name', 'title', 'media_type', 'url', 'youtube_id', 'alt_text', 'captured_date', 'active'];

    protected function casts(): array
    {
        return ['captured_date' => 'date:Y-m-d', 'active' => 'boolean'];
    }
}
