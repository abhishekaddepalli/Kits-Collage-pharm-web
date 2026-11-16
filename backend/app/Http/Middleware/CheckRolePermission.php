<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRolePermission
{
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        if (!$user || !$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated or inactive administrator account.',
            ], 401);
        }

        if (empty($permissions)) {
            return $next($request);
        }

        $userPermissions = $user->permissionKeys();

        foreach ($permissions as $permission) {
            if (in_array($permission, $userPermissions, true) || $user->isSuperAdmin()) {
                return $next($request);
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'Forbidden: You do not have the required permission for this module.',
        ], 403);
    }
}
