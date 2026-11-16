<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FormDefinition extends Model
{
    protected $table = 'forms';

    protected $fillable = ['name', 'slug', 'description', 'recipient_email', 'submit_label', 'success_message', 'fields_json', 'active'];

    protected function casts(): array
    {
        return ['fields_json' => 'array', 'active' => 'boolean'];
    }
}
