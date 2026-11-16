<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FooterSetting extends Model
{
    protected $fillable = [
        'logo_url', 'intro_text', 'address', 'phone', 'email', 'copyright_text',
        'background_color', 'text_color', 'columns_json', 'custom_block_title', 'custom_block_content',
    ];

    protected function casts(): array
    {
        return ['columns_json' => 'array'];
    }
}
