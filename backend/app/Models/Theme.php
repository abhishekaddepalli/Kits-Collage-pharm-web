<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Theme extends Model
{
    protected $fillable = ['slug', 'name', 'is_preset', 'is_active', 'palette_json'];

    protected function casts(): array
    {
        return [
            'is_preset' => 'boolean',
            'is_active' => 'boolean',
            'palette_json' => 'array',
        ];
    }

    public function setting(): HasOne
    {
        return $this->hasOne(ThemeSetting::class);
    }
}
