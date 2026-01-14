<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class DataRetentionPolicy extends Model
{
    use HasFactory;

    protected $fillable = [
        'entity_type',
        'retention_days',
        'date_field',
        'conditions',
        'is_active',
        'description'
    ];

    protected $casts = [
        'conditions' => 'array',
        'is_active' => 'boolean',
        'retention_days' => 'integer'
    ];

    public function getCutoffDateAttribute(): Carbon
    {
        return Carbon::now()->subDays($this->retention_days);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForEntity($query, string $entityType)
    {
        return $query->where('entity_type', $entityType);
    }
}
