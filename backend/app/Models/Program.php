<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    protected $fillable = [
        'name',
        'code',
        'level',
        'qualification',
        'duration',
        'eligibility',
        'description',
        'intake_capacity',
        'admission_info',
        'brochure_url',
        'verification_status',
        'active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return ['active' => 'boolean'];
    }
}
