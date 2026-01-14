<?php

namespace App\Traits;

use App\Services\AuditLogger;

trait Auditable
{
    private $auditLogger;
    private $originalData = [];

    /**
     * Initialiser l'audit pour le modèle
     */
    public function initAudit(AuditLogger $auditLogger)
    {
        $this->auditLogger = $auditLogger;
    }

    /**
     * Sauvegarder les données originales avant modification
     */
    public function saveOriginalData(array $data)
    {
        $this->originalData = $data;
    }

    /**
     * Auditer après création
     */
    public function auditAfterCreate(array $newData, string $resourceType)
    {
        if ($this->auditLogger) {
            $this->auditLogger->logDataModification(
                $resourceType,
                $newData['id'] ?? 0,
                [],
                $newData,
                'CREATE'
            );
        }
    }

    /**
     * Auditer après mise à jour
     */
    public function auditAfterUpdate(array $newData, string $resourceType)
    {
        if ($this->auditLogger && !empty($this->originalData)) {
            $this->auditLogger->logDataModification(
                $resourceType,
                $newData['id'] ?? 0,
                $this->originalData,
                $newData,
                'UPDATE'
            );
        }
    }

    /**
     * Auditer après suppression
     */
    public function auditAfterDelete(int $resourceId, string $resourceType)
    {
        if ($this->auditLogger) {
            $this->auditLogger->logDataModification(
                $resourceType,
                $resourceId,
                $this->originalData,
                [],
                'DELETE'
            );
        }
    }

    /**
     * Auditer un accès en lecture
     */
    public function auditRead(int $resourceId, string $resourceType, array $context = [])
    {
        if ($this->auditLogger) {
            $this->auditLogger->logDataAccess(
                'READ',
                $resourceType,
                $resourceId,
                $context
            );
        }
    }
}
