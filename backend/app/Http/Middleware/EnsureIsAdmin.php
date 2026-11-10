<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || $user->vaitro !== 'admin') {
            return response()->json([
                'message' => 'Không có quyền truy cập'
            ], 403);
        }

        return $next($request);
    }
}