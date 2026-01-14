<?php

namespace App\Services;

use App\Models\Contact;
use App\Models\Deal;
use App\Models\Activity;
use App\Models\Document;
use App\Models\EmailLog;
use App\Models\AuditLog;
use App\Models\DataRetentionPolicy;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class DataRetentionService
{
    protected array $purgeableEntities = [
        'contacts' => Contact::class,
        'deals' => Deal::class,
        'activities' => Activity::class,
        'documents' => Document::class,
        'email_logs' => EmailLog::class,
        'audit_logs' => AuditLog::class,
    ];

    public function purgeExpiredData(): array
    {
        $results = [];
        
        try {
            DB::beginTransaction();
            
            foreach ($this->purgeableEntities as $entity => $model) {
                $policy = DataRetentionPolicy::where('entity_type', $entity)
                    ->where('is_active', true)
                    ->first();
                
                if ($policy) {
                    $purgedCount = $this->purgeEntityData($model, $policy);
                    $results[$entity] = $purgedCount;
                    
                    Log::info("Purged {$purgedCount} records from {$entity}");
                }
            }
            
            DB::commit();
            
            // Log purge activity
            $this->logPurgeActivity($results);
            
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Data purge failed: ' . $e->getMessage());
            throw $e;
        }
        
        return $results;
    }

    protected function purgeEntityData(string $model, DataRetentionPolicy $policy): int
    {
        $cutoffDate = Carbon::now()->subDays($policy->retention_days);
        
        $query = $model::where($policy->date_field, '<', $cutoffDate);
        
        // Apply additional conditions if specified
        if ($policy->conditions) {
            foreach ($policy->conditions as $field => $value) {
                $query->where($field, $value);
            }
        }
        
        // Handle soft deletes
        if (method_exists($model, 'trashed')) {
            $query->withTrashed();
        }
        
        $recordsToDelete = $query->get();
        
        // Handle file cleanup for documents
        if ($model === Document::class) {
            $this->cleanupDocumentFiles($recordsToDelete);
        }
        
        // Perform hard delete
        $deletedCount = $query->forceDelete();
        
        return $deletedCount;
    }

    protected function cleanupDocumentFiles($documents): void
    {
        foreach ($documents as $document) {
            if ($document->file_path && Storage::exists($document->file_path)) {
                Storage::delete($document->file_path);
            }
        }
    }

    public function previewPurge(): array
    {
        $preview = [];
        
        foreach ($this->purgeableEntities as $entity => $model) {
            $policy = DataRetentionPolicy::where('entity_type', $entity)
                ->where('is_active', true)
                ->first();
            
            if ($policy) {
                $cutoffDate = Carbon::now()->subDays($policy->retention_days);
                
                $query = $model::where($policy->date_field, '<', $cutoffDate);
                
                if ($policy->conditions) {
                    foreach ($policy->conditions as $field => $value) {
                        $query->where($field, $value);
                    }
                }
                
                $count = $query->count();
                $preview[$entity] = [
                    'count' => $count,
                    'cutoff_date' => $cutoffDate->format('Y-m-d H:i:s'),
                    'retention_days' => $policy->retention_days
                ];
            }
        }
        
        return $preview;
    }

    protected function logPurgeActivity(array $results): void
    {
        $totalPurged = array_sum($results);
        
        AuditLog::create([
            'user_id' => null, // System action
            'action' => 'data_purge',
            'entity_type' => 'system',
            'entity_id' => null,
            'changes' => [
                'purge_results' => $results,
                'total_purged' => $totalPurged,
                'executed_at' => Carbon::now()->toISOString()
            ],
            'ip_address' => 'system',
            'user_agent' => 'DataRetentionService'
        ]);
    }

    public function createRetentionPolicy(array $data): DataRetentionPolicy
    {
        return DataRetentionPolicy::create([
            'entity_type' => $data['entity_type'],
            'retention_days' => $data['retention_days'],
            'date_field' => $data['date_field'] ?? 'created_at',
            'conditions' => $data['conditions'] ?? null,
            'is_active' => $data['is_active'] ?? true,
            'description' => $data['description'] ?? null
        ]);
    }
}
