<?php

namespace App\GDPR\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DataSubjectRequest extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'request_type',
        'status',
        'description',
        'submitted_at',
        'processed_at',
        'completed_at',
        'processor_id',
        'verification_token',
        'verification_expires_at',
        'is_verified',
        'request_data',
        'processing_notes',
        'attachments'
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'processed_at' => 'datetime',
        'completed_at' => 'datetime',
        'verification_expires_at' => 'datetime',
        'is_verified' => 'boolean',
        'request_data' => 'array',
        'attachments' => 'array'
    ];

    const REQUEST_TYPES = [
        'access' => 'Droit d\'accès',
        'rectification' => 'Droit de rectification',
        'erasure' => 'Droit à l\'effacement',
        'portability' => 'Droit à la portabilité',
        'restriction' => 'Droit à la limitation du traitement',
        'objection' => 'Droit d\'opposition'
    ];

    const STATUSES = [
        'pending_verification' => 'En attente de vérification',
        'verified' => 'Vérifié',
        'in_progress' => 'En cours de traitement',
        'completed' => 'Terminé',
        'rejected' => 'Rejeté'
    ];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function processor()
    {
        return $this->belongsTo(\App\Models\User::class, 'processor_id');
    }

    public function getRequestTypeLabel()
    {
        return self::REQUEST_TYPES[$this->request_type] ?? $this->request_type;
    }

    public function getStatusLabel()
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }

    public function isExpired()
    {
        return $this->verification_expires_at && 
               $this->verification_expires_at->isPast() && 
               !$this->is_verified;
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending_verification');
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'in_progress');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
}
