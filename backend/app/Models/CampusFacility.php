<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CampusFacility extends Model
{
    protected $fillable = ['slug', 'title', 'category', 'summary', 'details', 'highlights_json', 'image_url', 'image_alt', 'active', 'sort_order'];

    protected function casts(): array
    {
        return ['highlights_json' => 'array', 'active' => 'boolean'];
    }
}
