<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AcademicCalendar extends Model
{
    protected $fillable = ['academic_year', 'title', 'semester', 'start_date', 'end_date', 'document_url', 'active'];

    protected function casts(): array
    {
        return [
            'start_date' => 'date:Y-m-d',
            'end_date' => 'date:Y-m-d',
            'active' => 'boolean',
        ];
    }
}
