<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatbotSetting extends Model
{
    protected $fillable = [
        'enabled', 'name', 'avatar_url', 'welcome_message', 'primary_color',
        'suggested_questions_json', 'fallback_message', 'ai_enabled', 'ai_model', 'retention_days',
    ];

    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
            'ai_enabled' => 'boolean',
            'suggested_questions_json' => 'array',
        ];
    }
}
