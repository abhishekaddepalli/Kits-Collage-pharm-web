<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EnquiryAssignment extends Model
{
    protected $fillable = ['enquiry_id', 'assigned_to_user_id', 'assigned_by_user_id', 'assigned_at'];

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }
}
