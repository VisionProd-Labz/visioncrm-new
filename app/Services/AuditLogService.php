<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditLogService
{
    /**
     * Enregistrer un événement d'audit
     */
    public function log($event, $data = [], $level = 'info')
    {
        if (!config('security.audit_log.enabled')) {
            return;
        }
        
        $logData = [
            'event' => $event,
            'user_id' => Auth::id(),
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'url' => Request::fullUrl(),
            'method' => Request::method(),
            'data' => $this->sanitizeData($data),
            'level' => $level,
            'created_at' => now(),
        ];
        
        // Enregistrer en base de données
        AuditLog::create($logData);
        
        // Enregistrer dans les logs système
        \Log::channel('audit')->info($event, $logData);
    }
    
    /**
     * Nettoyer les données sensibles
     */
    private function sanitizeData($data)
    {
        $sensitiveFields = [
            'password',
            'password_confirmation',
            'token',
            'credit_card',
            'ssn',
            'api_key'
        ];
        
        if (is_array($data)) {
            foreach ($sensitiveFields as $field) {
                if (isset($data[$field])) {
                    $data[$field] = '[REDACTED]';
                }
            }
        }
        
        return $data;
    }
    
    /**
     * Purger les anciens logs
     */
    public function purgeOldLogs()
    {
        $retentionDays = config('security.audit_log.retention_days');
        $cutoffDate = now()->subDays($retentionDays);
        
        AuditLog::where('created_at', '<', $cutoffDate)->delete();
    }
}
