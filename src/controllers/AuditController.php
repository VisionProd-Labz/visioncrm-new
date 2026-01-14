<?php

namespace App\Controllers;

use App\Services\AuditLogger;
use PDO;

class AuditController
{
    private $auditLogger;

    public function __construct(PDO $db)
    {
        $this->auditLogger = new AuditLogger($db);
    }

    /**
     * Afficher le tableau de bord des audits
     */
    public function dashboard()
    {
        // Vérifier les permissions
        if (!$this->hasAuditPermission()) {
            http_response_code(403);
            echo json_encode(['error' => 'Accès interdit']);
            return;
        }

        $stats = $this->getAuditStats();
        $recentLogs = $this->auditLogger->getLogs([], 1, 20);

        include __DIR__ . '/../views/audit/dashboard.php';
    }

    /**
     * API pour récupérer les logs avec filtres
     */
    public function getLogs()
    {
        if (!$this->hasAuditPermission()) {
            http_response_code(403);
            echo json_encode(['error' => 'Accès interdit']);
            return;
        }

        $filters = [
            'event_type' => $_GET['event_type'] ?? '',
            'user_id' => $_GET['user_id'] ?? '',
            'resource' => $_GET['resource'] ?? '',
            'date_from' => $_GET['date_from'] ?? '',
            'date_to' => $_GET['date_to'] ?? '',
            'severity' => $_GET['severity'] ?? ''
        ];

        // Nettoyer les filtres vides
        $filters = array_filter($filters);

        $page = (int)($_GET['page'] ?? 1);
        $perPage = min((int)($_GET['per_page'] ?? 50), 100); // Max 100 par page

        $logs = $this->auditLogger->getLogs($filters, $page, $perPage);

        header('Content-Type: application/json');
        echo json_encode([
            'logs' => $logs,
            'page' => $page,
            'per_page' => $perPage,
            'filters' => $filters
        ]);
    }

    /**
     * Exporter les logs en CSV
     */
    public function exportLogs()
    {
        if (!$this->hasAuditPermission()) {
            http_response_code(403);
            echo "Accès interdit";
            return;
        }

        $filters = [
            'date_from' => $_GET['date_from'] ?? date('Y-m-d', strtotime('-30 days')),
            'date_to' => $_GET['date_to'] ?? date('Y-m-d')
        ];

        $logs = $this->auditLogger->getLogs($filters, 1, 10000);

        // Log de l'export
        $this->auditLogger->logSecurityEvent(
            'AUDIT_EXPORT',
            'Export des logs d\'audit',
            'HIGH',
            ['filters' => $filters, 'count' => count($logs)]
        );

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="audit_logs_' . date('Y-m-d') . '.csv"');

        $output = fopen('php://output', 'w');
        
        // En-têtes CSV
        fputcsv($output, [
            'ID', 'Type', 'Action', 'Ressource', 'ID Ressource', 'Utilisateur',
            'IP', 'Timestamp', 'Sévérité', 'Description'
        ]);

        // Données
        foreach ($logs as $log) {
            fputcsv($output, [
                $log['id'],
                $log['event_type'],
                $log['action'],
                $log['resource'],
                $log['resource_id'],
                $log['user_id'],
                $log['ip_address'],
                $log['timestamp'],
                $log['severity'],
                $log['description']
            ]);
        }

        fclose($output);
    }

    /**
     * Statistiques d'audit
     */
    private function getAuditStats(): array
    {
        // À implémenter selon vos besoins
        return [
            'total_events_today' => 0,
            'failed_logins_today' => 0,
            'data_modifications_today' => 0,
            'high_severity_events' => 0
        ];
    }

    /**
     * Vérifier les permissions d'audit
     */
    private function hasAuditPermission(): bool
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $userRole = $_SESSION['user_role'] ?? '';
        $allowedRoles = ['admin', 'audit_manager', 'compliance_officer'];

        return in_array($userRole, $allowedRoles);
    }
}
