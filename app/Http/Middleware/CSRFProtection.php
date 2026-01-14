<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class CSRFProtection
{
    public function handle(Request $request, Closure $next)
    {
        if (!config('security.csrf.enabled')) {
            return $next($request);
        }
        
        if ($this->shouldSkip($request)) {
            return $next($request);
        }
        
        if (!$this->isValidCSRFToken($request)) {
            return response()->json(['error' => 'CSRF token mismatch'], 419);
        }
        
        return $next($request);
    }
    
    private function shouldSkip(Request $request)
    {
        $skipMethods = ['GET', 'HEAD', 'OPTIONS'];
        return in_array($request->method(), $skipMethods);
    }
    
    private function isValidCSRFToken(Request $request)
    {
        $token = $request->header('X-CSRF-TOKEN') ?: $request->input('_token');
        $sessionToken = Session::token();
        
        return hash_equals($sessionToken, $token);
    }
}
