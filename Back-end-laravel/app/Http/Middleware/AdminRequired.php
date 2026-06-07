<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminRequired
{
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Check user logging-in ha ya nahi (Sanctum handle karta ha)
        // 2. Check role 'admin' ha ya nahi
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json(['detail' => 'Admin privileges required'], 403);
        }

        return $next($request);
    }
}