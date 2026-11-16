<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HeaderSetting extends Model
{
    protected $fillable = [
        'college_name', 'college_subtitle', 'location_short', 'affiliation_text', 'approval_text',
        'phone', 'secondary_phone', 'email', 'working_hours', 'announcement_text', 'announcement_link',
        'show_announcement', 'exam_portal_label', 'exam_portal_url', 'student_portal_label',
        'student_portal_url', 'default_language', 'apply_button_label', 'apply_button_path',
        'logo_media_id', 'logo_url', 'header_bg', 'header_text_color', 'nav_bg', 'nav_text_color', 'sticky',
    ];

    protected function casts(): array
    {
        return ['show_announcement' => 'boolean', 'sticky' => 'boolean'];
    }
}
