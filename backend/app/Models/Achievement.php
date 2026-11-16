<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Achievement extends Model
{
    protected $fillable = ['category', 'title', 'recipient', 'year', 'description', 'image_url', 'verification_status', 'active'];

    protected function casts(): array
    {
        return ['active' => 'boolean'];
    }
}
