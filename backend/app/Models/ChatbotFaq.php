<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatbotFaq extends Model
{
    protected $fillable = ['category_id', 'category_name', 'question', 'answer', 'enabled', 'sort_order'];

    protected function casts(): array
    {
        return ['enabled' => 'boolean'];
    }

    public function keywords(): HasMany
    {
        return $this->hasMany(ChatbotKeyword::class, 'faq_id');
    }
}
