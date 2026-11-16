<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PageRevision extends Model
{
    public $timestamps = false;

    protected $fillable = ['page_id', 'snapshot_json', 'created_by', 'created_at'];

    protected function casts(): array
    {
        return [
            'snapshot_json' => 'array',
            'created_at' => 'datetime',
        ];
    }
}
