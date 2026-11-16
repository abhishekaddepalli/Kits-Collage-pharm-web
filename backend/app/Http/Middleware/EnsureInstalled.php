<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpFoundation\Response;

class EnsureInstalled
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!self::isInstalled()) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'code' => 'NOT_INSTALLED',
                    'message' => 'Application installation is not yet completed.',
                ], 503);
            }

            return redirect('/install');
        }

        return $next($request);
    }

    public static function isInstalled(): bool
    {
        if (file_exists(storage_path('app/installed.lock'))) {
            return true;
        }

        try {
            if (Schema::hasTable('installation_status')) {
                return (bool) DB::table('installation_status')->where('is_installed', true)->exists();
            }
        } catch (\Throwable) {
            return false;
        }

        return false;
    }
}
