<?php

use App\Http\Middleware\CheckRolePermission;
use App\Http\Middleware\EnsureInstalled;
use App\Http\Middleware\EnsureNotInstalled;
use App\Http\Middleware\NoIndexAdminHeaders;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->statefulApi();

        $middleware->alias([
            'installed' => EnsureInstalled::class,
            'not.installed' => EnsureNotInstalled::class,
            'permission' => CheckRolePermission::class,
            'noindex.admin' => NoIndexAdminHeaders::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*')) {
                $status = $e instanceof HttpExceptionInterface ? $e->getStatusCode() : 500;
                $message = $status === 500 && !config('app.debug')
                    ? 'An internal server error occurred.'
                    : $e->getMessage();

                return response()->json([
                    'success' => false,
                    'message' => $message,
                ], $status);
            }
            return null;
        });
    })
    ->create();
