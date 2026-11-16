<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ThemeSetting extends Model
{
    protected $fillable = ['theme_id', 'typography_json', 'layout_json', 'custom_css'];

    protected function casts(): array
    {
        return [
            'typography_json' => 'array',
            'layout_json' => 'array',
        ];
    }

    public function theme(): BelongsTo
    {
        return $this->belongsTo(Theme::class);
    }
}
