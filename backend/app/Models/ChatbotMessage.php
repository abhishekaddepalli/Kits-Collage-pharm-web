<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatbotMessage extends Model
{
    public $timestamps = false;

    protected $fillable = ['conversation_id', 'sender', 'message_text', 'matched_faq_id', 'provider', 'matched', 'created_at'];

    protected function casts(): array
    {
        return ['matched' => 'boolean', 'created_at' => 'datetime'];
    }
}
