<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AcademicDocument extends Model
{
    protected $fillable = ['title', 'category', 'file_url', 'file_size', 'published_date', 'active'];

    protected function casts(): array
    {
        return [
            'published_date' => 'date:Y-m-d',
            'active' => 'boolean',
        ];
    }
}
