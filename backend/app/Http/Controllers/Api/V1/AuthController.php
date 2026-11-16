<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    use ApiResponse;

    public function csrf(Request $request): JsonResponse
    {
        $request->session()->regenerateToken();

        return $this->ok(['csrfToken' => csrf_token()], 'CSRF cookie initialized.');
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'identifier' => ['required', 'string', 'max:191'],
            'password' => ['required', 'string', 'max:191'],
            'remember' => ['nullable', 'boolean'],
        ]);

        $field = filter_var($validated['identifier'], FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
        $user = User::where($field, $validated['identifier'])->with('roles.permissions')->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return $this->fail('Invalid username/email or password.', 401);
        }

        if (!$user->is_active) {
            return $this->fail('This administrator account is currently suspended.', 403);
        }

        Auth::login($user, (bool) ($validated['remember'] ?? false));
        $request->session()->regenerate();

        $user->forceFill([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ])->save();

        ActivityLog::create([
            'user_id' => $user->id,
            'actor_name' => $user->name,
            'actor_role' => $user->primaryRoleName(),
            'action' => 'Signed in to CMS Control Panel',
            'module' => 'Authentication',
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return $this->ok([
            'user' => $this->serializeUser($user),
        ], 'Authenticated successfully.');
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()?->load('roles.permissions');

        if (!$user) {
            return $this->fail('Unauthenticated.', 401);
        }

        return $this->ok(['user' => $this->serializeUser($user)]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user) {
            ActivityLog::create([
                'user_id' => $user->id,
                'actor_name' => $user->name,
                'actor_role' => $user->primaryRoleName(),
                'action' => 'Signed out of CMS Control Panel',
                'module' => 'Authentication',
                'ip_address' => $request->ip(),
                'created_at' => now(),
            ]);
        }

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return $this->ok(null, 'Signed out securely.');
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $validated['email'])->where('is_active', true)->first();

        if ($user) {
            $token = Str::random(64);
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                ['token' => Hash::make($token), 'created_at' => now()]
            );

            try {
                $resetUrl = rtrim(config('app.url'), '/').'/reset-password?token='.urlencode($token).'&email='.urlencode($user->email);
                Mail::raw("Reset your KITS Pharmacy CMS password here: {$resetUrl}\n\nThis link expires in 60 minutes.", function ($msg) use ($user) {
                    $msg->to($user->email)->subject('KITS Pharmacy CMS — Password Reset Request');
                });
            } catch (\Throwable) {
                // Mail configuration optional on initial local setup
            }
        }

        return $this->ok(null, 'If an active administrator account matches that email, a password reset link has been dispatched.');
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $record = DB::table('password_reset_tokens')->where('email', $validated['email'])->first();

        if (!$record || !Hash::check($validated['token'], $record->token)) {
            return $this->fail('Invalid or expired password reset token.', 422);
        }

        if (now()->diffInMinutes($record->created_at) > 60) {
            return $this->fail('Password reset token has expired.', 422);
        }

        $user = User::where('email', $validated['email'])->firstOrFail();
        $user->update(['password' => Hash::make($validated['password'])]);

        DB::table('password_reset_tokens')->where('email', $validated['email'])->delete();

        return $this->ok(null, 'Password has been reset. You may now sign in.');
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'email', 'max:191', 'unique:users,email,'.$user->id],
        ]);

        $user->update($validated);
        $user->load('roles.permissions');

        return $this->ok(['user' => $this->serializeUser($user)], 'Profile updated.');
    }

    public function changePassword(Request $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'currentPassword' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if (!Hash::check($validated['currentPassword'], $user->password)) {
            return $this->fail('Current password is incorrect.', 422);
        }

        $user->update(['password' => Hash::make($validated['password'])]);

        return $this->ok(null, 'Password changed successfully.');
    }

    protected function serializeUser(User $user): array
    {
        return [
            'id' => (string) $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'role' => $user->primaryRoleName(),
            'permissions' => $user->permissionKeys(),
            'active' => $user->is_active,
            'lastLogin' => $user->last_login_at?->toIso8601String() ?? 'Now',
        ];
    }
}
