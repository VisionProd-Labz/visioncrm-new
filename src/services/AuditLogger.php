<?php

namespace App\Services;

use DateTime;
use PDO;
use Exception;

class AuditLogger
{
    private $db;
    private $userId;
    private $userRole;
    private $ipAddress;
    private $userAgent;

    public function __construct(PDO $db)
    {
        $this->db = $db;
        $this->ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $this->userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
        
        // Récupérer les informations de l'utilisateur connecté
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $this->userId = $_SESSION['user_id'] ?? null;
        $this->userRole = $_SESSION['user_role'] ?? null;
    }

    /**
     * Enregistrer un accès aux données personnelles
     */
    public function logDataAccess(string $action, string $resource, int $resourceId, array $additionalData = [])
    {
        $this->log([
            'event_type' => 'DATA_ACCESS',
            'action' => $action,
            'resource' => $resource,
            'resource_id' => $resourceId,
            'user_id' => $this->userId,
            'user_role' => $this->userRole,
            'ip_address' => $this->ipAddress,
            'user_agent' => $this->userAgent,
            'timestamp' => new DateTime(),
            'additional_data' => json_encode($additionalData),
            'severity' => $this->determineSeverity($action)
        ]);
    }

    /**
     * Enregistrer une modification de données personnelles
     */
    public function logDataModification(string $resource, int $resourceId, array $oldData, array $newData, string $action = 'UPDATE')
    {
        $changes = $this->calculateChanges($oldData, $newData);
        
        $this->log([
            'event_type' => 'DATA_MODIFICATION',
            'action' => $action,
            'resource' => $resource,
            'resource_id' => $resourceId,
            'user_id' => $this->userId,
            'user_role' => $this->userRole,
            'ip_address' => $this->ipAddress,
            'user_agent' => $this->userAgent,
            'timestamp' => new DateTime(),
            'changes' => json_encode($changes),
            'old_data' => json_encode($this->sanitizePersonalData($oldData)),
            'new_data' => json_encode($this->sanitizePersonalData($newData)),
            'severity' => $this->determineSeverity($action)
        ]);
    }

    /**
     * Enregistrer un événement de sécurité
     */
    public function logSecurityEvent(string $event, string $description, string $severity = 'MEDIUM', array $context = [])
    {
        $this->log([
            'event_type' => 'SECURITY',
            'action' => $event,
            'resource' => 'SYSTEM',
            'resource_id' => 0,
            'user_id' => $this->userId,
            'user_role' => $this->userRole,
            'ip_address' => $this->ipAddress,
            'user_agent' => $this->userAgent,
            'timestamp' => new DateTime(),
            'description' => $description,
            'additional_data' => json_encode($context),
            'severity' => $severity
        ]);
    }

    /**
     * Enregistrer un événement d'authentification
     */
    public function logAuthEvent(string $action, int $userId = null, bool $success = true, string $reason = '')
    {
        $this->log([
            'event_type' => 'AUTHENTICATION',
            'action' => $action,
            'resource' => 'USER',
            'resource_id' => $userId ?? 0,
            'user_id' => $userId,
            'user_role' => null,
            'ip_address' => $this->ipAddress,
            'user_agent' => $this->userAgent,
            'timestamp' => new DateTime(),
            'success' => $success,
            'reason' => $reason,
            'severity' => $success ? 'LOW' : 'HIGH'
        ]);
    }

    /**
     * Méthode principale pour enregistrer les logs
     */
    private function log(array $data)
    {
        try {
            $sql = "INSERT INTO audit_logs (
                event_type, action, resource, resource_id, user_id, user_role,
                ip_address, user_agent, timestamp, changes, old_data, new_data,
                additional_data, description, success, reason, severity
            ) VALUES (
                :event_type, :action, :resource, :resource_id, :user_id, :user_role,
                :ip_address, :user_agent, :timestamp, :changes, :old_data, :new_data,
                :additional_data, :description, :success, :reason, :severity
            )";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                'event_type' => $data['event_type'],
                'action' => $data['action'],
                'resource' => $data['resource'],
                'resource_id' => $data['resource_id'],
                'user_id' => $data['user_id'],
                'user_role' => $data['user_role'],
                'ip_address' => $data['ip_address'],
                'user_agent' => $data['user_agent'],
                'timestamp' => $data['timestamp']->format('Y-m-d H:i:s'),
                'changes' => $data['changes'] ?? null,
                'old_data' => $data['old_data'] ?? null,
                'new_data' => $data['new_data'] ?? null,
                'additional_data' => $data['additional_data'] ?? null,
                'description' => $data['description'] ?? null,
                'success' => $data['success'] ?? true,
                'reason' => $data['reason'] ?? null,
                'severity' => $data['severity'] ?? 'MEDIUM'
            ]);

            // Log aussi dans un fichier pour backup
            $this->logToFile($data);

        } catch (Exception $e) {
            // En cas d'erreur avec la base, log uniquement dans le fichier
            error_log("Erreur audit log DB: " . $e->getMessage());
            $this->logToFile($data);
        }
    }

    /**
     * Log dans un fichier
     */
    private function logToFile(array $data)
    {
        $logFile = __DIR__ . '/../../logs/audit_' . date('Y-m-d') . '.log';
        $logDir = dirname($logFile);
        
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }

        $logEntry = [
            'timestamp' => ($data['timestamp'] instanceof DateTime) ? $data['timestamp']->format('Y-m-d H:i:s') : $data['timestamp'],
            'event_type' => $data['event_type'],
            'action' => $data['action'],
            'resource' => $data['resource'],
            'resource_id' => $data['resource_id'],
            'user_id' => $data['user_id'],
            'ip_address' => $data['ip_address'],
            'severity' => $data['severity'] ?? 'MEDIUM'
        ];

        file_put_contents($logFile, json_encode($logEntry) . "\n", FILE_APPEND | LOCK_EX);
    }

    /**
     * Calculer les changements entre ancienne et nouvelle donnée
     */
    private function calculateChanges(array $oldData, array $newData): array
    {
        $changes = [];
        
        foreach ($newData as $field => $newValue) {
            $oldValue = $oldData[$field] ?? null;
            if ($oldValue !== $newValue) {
                $changes[$field] = [
                    'old' => $oldValue,
                    'new' => $newValue
                ];
            }
        }
        
        return $changes;
    }

    /**
     * Sanitiser les données personnelles pour les logs
     */
    private function sanitizePersonalData(array $data): array
    {
        $sensitiveFields = [
            'password', 'token', 'api_key', 'secret', 
            'credit_card', 'ssn', 'tax_id'
        ];
        
        $sanitized = $data;
        
        foreach ($sensitiveFields as $field) {
            if (isset($sanitized[$field])) {
                $sanitized[$field] = '[REDACTED]';
            }
        }
        
        return $sanitized;
    }

    /**
     * Déterminer la sévérité d'un événement
     */
    private function determineSeverity(string $action): string
    {
        $severityMap = [
            'CREATE' => 'MEDIUM',
            'READ' => 'LOW',
            'UPDATE' => 'MEDIUM',
            'DELETE' => 'HIGH',
            'EXPORT' => 'HIGH',
            'LOGIN' => 'LOW',
            'LOGOUT' => 'LOW',
            'FAILED_LOGIN' => 'HIGH',
            'PERMISSION_DENIED' => 'HIGH'
        ];
        
        return $severityMap[$action] ?? 'MEDIUM';
    }

    /**
     * Récupérer les logs avec filtres
     */
    public function getLogs(array $filters = [], int $page = 1, int $perPage = 50): array
    {
        $where = [];
        $params = [];
        
        if (!empty($filters['event_type'])) {
            $where[] = "event_type = :event_type";
            $params['event_type'] = $filters['event_type'];
        }
        
        if (!empty($filters['user_id'])) {
            $where[] = "user_id = :user_id";
            $params['user_id'] = $filters['user_id'];
        }
        
        if (!empty($filters['resource'])) {
            $where[] = "resource = :resource";
            $params['resource'] = $filters['resource'];
        }
        
        if (!empty($filters['date_from'])) {
            $where[] = "timestamp >= :date_from";
            $params['date_from'] = $filters['date_from'];
        }
        
        if (!empty($filters['date_to'])) {
            $where[] = "timestamp <= :date_to";
            $params['date_to'] = $filters['date_to'];
        }
        
        if (!empty($filters['severity'])) {
            $where[] = "severity = :severity";
            $params['severity'] = $filters['severity'];
        }
        
        $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        
        $offset = ($page - 1) * $perPage;
        $params['limit'] = $perPage;
        $params['offset'] = $offset;
        
        $sql = "SELECT * FROM audit_logs $whereClause ORDER BY timestamp DESC LIMIT :limit OFFSET :offset";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
