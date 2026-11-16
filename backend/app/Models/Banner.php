<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    protected $fillable = ['title', 'subtitle', 'cta_label', 'cta_link', 'image_url', 'placement', 'active'];

    protected function casts(): array
    {
        return ['active' => 'boolean'];
    }
}
