<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SliderItem extends Model
{
    protected $fillable = [
        'slider_id',
        'badge',
        'heading',
        'highlighted_text',
        'subheading',
        'description',
        'desktop_image',
        'mobile_image',
        'image_alt',
        'primary_cta_label',
        'primary_cta_link',
        'secondary_cta_label',
        'secondary_cta_link',
        'overlay_opacity',
        'text_position',
        'animation',
        'duration_ms',
        'sort_order',
        'active',
        'start_date',
        'end_date',
        'video_url',
    ];

    protected function casts(): array
    {
        return [
            'overlay_opacity' => 'float',
            'active' => 'boolean',
            'start_date' => 'date:Y-m-d',
            'end_date' => 'date:Y-m-d',
        ];
    }

    public function slider(): BelongsTo
    {
        return $this->belongsTo(Slider::class);
    }
}
