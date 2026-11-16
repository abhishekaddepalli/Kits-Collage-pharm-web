<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    protected $fillable = ['student_name', 'photo_url', 'course', 'graduation_year', 'quote', 'verification_status', 'active'];

    protected function casts(): array
    {
        return ['active' => 'boolean'];
    }
}
