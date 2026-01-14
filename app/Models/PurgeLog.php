<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurgeLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'entity_type',
        'records_purged',
        'cutoff_date',
        'retention_days',
        'additional_info',
        'status',
        'error_message',
        'executed_at',
        'execution_time'
    ];

    protected $casts = [
        'additional_info' => 'array',
        'cutoff_date' => 'datetime',
        'executed_at' => 'datetime',
        'execution_time' => 'decimal:2'
    ];

    public function scopeSuccessful($query)
    {
        return $query->where('status', 'success');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeForEntity($query, string $entityType)
    {
        return $query->where('entity_type', $entityType);
    }
}
