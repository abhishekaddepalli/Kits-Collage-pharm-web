<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Placement extends Model
{
    protected $fillable = ['company_name', 'sector', 'role_title', 'year', 'notes', 'verification_status', 'active'];

    protected function casts(): array
    {
        return ['active' => 'boolean'];
    }
}
