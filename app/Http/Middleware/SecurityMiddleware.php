<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use App\Services\AuditLogService;

class SecurityMiddleware
{
    private $auditLog;
    
    public function __construct(AuditLogService $auditLog)
    {
        $this->auditLog = $auditLog;
    }
    
    public function handle(Request $request, Closure $next, ...$permissions)
    {
        // Vérification du rate limiting
        if ($this->isRateLimited($request)) {
            $this->auditLog->log('rate_limit_exceeded', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
            
            return response()->json(['error' => 'Too many requests'], 429);
        }
        
        // Vérification de l'authentification
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        $user = Auth::user();
        
        // Vérification des permissions
        if (!empty($permissions) && !$this->hasPermissions($user, $permissions)) {
            $this->auditLog->log('access_denied', [
                'user_id' => $user->id,
                'required_permissions' => $permissions,
                'url' => $request->url(),
            ]);
            
            return response()->json(['error' => 'Forbidden'], 403);
        }
        
        // Vérification de la session
        if ($this->isSessionExpired($request)) {
            Auth::logout();
            return response()->json(['error' => 'Session expired'], 401);
        }
        
        // Log de l'accès autorisé
        $this->auditLog->log('access_granted', [
            'user_id' => $user->id,
            'url' => $request->url(),
            'method' => $request->method(),
        ]);
        
        return $next($request);
    }
    
    private function isRateLimited(Request $request)
    {
        $key = 'api:' . $request->ip();
        $maxAttempts = config('security.rate_limiting.api_requests.max_attempts');
        $decayMinutes = config('security.rate_limiting.api_requests.decay_minutes');
        
        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            return true;
        }
        
        RateLimiter::hit($key, $decayMinutes * 60);
        return false;
    }
    
    private function hasPermissions($user, $permissions)
    {
        foreach ($permissions as $permission) {
            if (!$user->hasPermission($permission)) {
                return false;
            }
        }
        return true;
    }
    
    private function isSessionExpired(Request $request)
    {
        $lastActivity = $request->session()->get('last_activity', 0);
        $sessionLifetime = config('security.session.lifetime') * 60; // Convert to seconds
        
        return (time() - $lastActivity) > $sessionLifetime;
    }
}
