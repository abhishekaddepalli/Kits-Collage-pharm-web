<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InstallationStatus extends Model
{
    protected $table = 'installation_status';

    protected $fillable = ['is_installed', 'app_version', 'admin_login_path', 'admin_panel_path', 'installed_at', 'installed_by_email'];

    protected function casts(): array
    {
        return ['is_installed' => 'boolean', 'installed_at' => 'datetime'];
    }
}
