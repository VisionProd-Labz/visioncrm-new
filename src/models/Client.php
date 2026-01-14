<?php

namespace App\Models;

use App\Traits\Auditable;
use App\Services\AuditLogger;
use PDO;

class Client
{
    use Auditable;

    private $db;
    private $table = 'clients';

    public function __construct(PDO $db, AuditLogger $auditLogger = null)
    {
        $this->db = $db;
        if ($auditLogger) {
            $this->initAudit($auditLogger);
        }
    }

    /**
     * Créer un nouveau client avec audit
     */
    public function create(array $data): int
    {
        $sql = "INSERT INTO {$this->table} (nom, prenom, email, telephone, adresse, created_at) 
                VALUES (:nom, :prenom, :email, :telephone, :adresse, NOW())";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'nom' => $data['nom'],
            'prenom' => $data['prenom'],
            'email' => $data['email'],
            'telephone' => $data['telephone'] ?? null,
            'adresse' => $data['adresse'] ?? null
        ]);

        $clientId = $this->db->lastInsertId();
        $data['id'] = $clientId;

        // Audit
        $this->auditAfterCreate($data, 'CLIENT');

        return $clientId;
    }

    /**
     * Récupérer un client par ID avec audit
     */
    public function findById(int $id): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE id = :id AND deleted_at IS NULL";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['id' => $id]);
        
        $client = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($client) {
            // Audit de l'accès
            $this->auditRead($id, 'CLIENT');
        }
        
        return $client ?: null;
    }

    /**
     * Mettre à jour un client avec audit
     */
    public function update(int $id, array $data): bool
    {
        // Récupérer les données originales
        $original = $this->findById($id);
        if (!$original) {
            return false;
        }

        $this->saveOriginalData($original);

        $sql = "UPDATE {$this->table} SET 
                nom = :nom, prenom = :prenom, email = :email, 
                telephone = :telephone, adresse = :adresse, updated_at = NOW()
                WHERE id = :id";

        $stmt = $this->db->prepare($sql);
        $result = $stmt->execute([
            'id' => $id,
            'nom' => $data['nom'],
            'prenom' => $data['prenom'],
            'email' => $data['email'],
            'telephone' => $data['telephone'] ?? null,
            'adresse' => $data['adresse'] ?? null
        ]);

        if ($result) {
            $data['id'] = $id;
            $this->auditAfterUpdate($data, 'CLIENT');
        }

        return $result;
    }

    /**
     * Supprimer un client (soft delete) avec audit
     */
    public function delete(int $id): bool
    {
        // Récupérer les données avant suppression
        $original = $this->findById($id);
        if (!$original) {
            return false;
        }

        $this->saveOriginalData($original);

        $sql = "UPDATE {$this->table} SET deleted_at = NOW() WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $result = $stmt->execute(['id' => $id]);

        if ($result) {
            $this->auditAfterDelete($id, 'CLIENT');
        }

        return $result;
    }

    /**
     * Exporter les données client avec audit
     */
    public function exportData(int $clientId): array
    {
        $client = $this->findById($clientId);
        
        if ($client) {
            // Audit de l'export (action sensible)
            if ($this->auditLogger) {
                $this->auditLogger->logDataAccess(
                    'EXPORT',
                    'CLIENT',
                    $clientId,
                    ['export_type' => 'full_data', 'format' => 'array']
                );
            }
        }
        
        return $client ?: [];
    }
}
