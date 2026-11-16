<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationItem extends Model
{
    protected $table = 'notifications';

    protected $fillable = ['user_id', 'title', 'message', 'type', 'is_read', 'link'];

    protected function casts(): array
    {
        return ['is_read' => 'boolean'];
    }
}
