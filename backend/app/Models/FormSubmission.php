<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormSubmission extends Model
{
    public $timestamps = false;

    protected $fillable = ['form_id', 'payload_json', 'ip_address', 'created_at'];

    protected function casts(): array
    {
        return ['payload_json' => 'array', 'created_at' => 'datetime'];
    }
}
