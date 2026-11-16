<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureNotInstalled
{
    public function handle(Request $request, Closure $next): Response
    {
        if (EnsureInstalled::isInstalled()) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'code' => 'ALREADY_INSTALLED',
                    'message' => 'Application is already installed. Installer endpoints are permanently locked.',
                ], 403);
            }

            return redirect('/');
        }

        return $next($request);
    }
}
