<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdmissionCampaign extends Model
{
    protected $fillable = [
        'academic_year', 'admissions_open', 'headline', 'subtext',
        'important_dates_json', 'scholarship_note', 'fee_note', 'process_steps_json',
    ];

    protected function casts(): array
    {
        return [
            'admissions_open' => 'boolean',
            'important_dates_json' => 'array',
            'process_steps_json' => 'array',
        ];
    }
}
