<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    protected $table = 'media';

    protected $fillable = [
        'folder_id',
        'folder_name',
        'title',
        'alt_text',
        'type',
        'disk_path',
        'public_url',
        'mime_type',
        'file_size_bytes',
        'file_size_label',
        'dimensions',
        'uploaded_by',
    ];
}
