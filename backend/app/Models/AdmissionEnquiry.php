<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class AdmissionEnquiry extends Model
{
    protected $fillable = [
        'reference_code', 'campaign_id', 'student_name', 'parent_name', 'mobile', 'email',
        'interested_program', 'qualification', 'city', 'state', 'message', 'status',
        'follow_up_date', 'ip_address',
    ];

    protected function casts(): array
    {
        return ['follow_up_date' => 'date:Y-m-d'];
    }

    public function notesHistory(): HasMany
    {
        return $this->hasMany(EnquiryNote::class, 'enquiry_id')->latest();
    }

    public function latestAssignment(): HasOne
    {
        return $this->hasOne(EnquiryAssignment::class, 'enquiry_id')->latestOfMany();
    }
}
