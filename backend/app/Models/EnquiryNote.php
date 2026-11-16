<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EnquiryNote extends Model
{
    protected $fillable = ['enquiry_id', 'user_id', 'note'];
}
