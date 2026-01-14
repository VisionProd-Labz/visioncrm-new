<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\DataRetentionService;
use App\Models\DataRetentionPolicy;
use App\Models\PurgeLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DataRetentionController extends Controller
{
    protected DataRetentionService $retentionService;

    public function __construct(DataRetentionService $retentionService)
    {
        $this->retentionService = $retentionService;
    }

    public function index()
    {
        $policies = DataRetentionPolicy::orderBy('entity_type')->get();
        $recentLogs = PurgeLog::with('policy')
            ->orderBy('executed_at', 'desc')
            ->limit(20)
            ->get();

        return view('admin.data-retention.index', compact('policies', 'recentLogs'));
    }

    public function policies(): JsonResponse
    {
        $policies = DataRetentionPolicy::orderBy('entity_type')->get();
        return response()->json($policies);
    }

    public function createPolicy(Request $request): JsonResponse
    {
        $request->validate([
            'entity_type' => 'required|string',
            'retention_days' => 'required|integer|min:1',
            'date_field' => 'required|string',
            'description' => 'nullable|string'
        ]);

        try {
            $policy = $this->retentionService->createRetentionPolicy($request->all());
            
            return response()->json([
                'success' => true,
                'policy' => $policy,
                'message' => 'Retention policy created successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create retention policy: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updatePolicy(Request $request, DataRetentionPolicy $policy): JsonResponse
    {
        $request->validate([
            'retention_days' => 'required|integer|min:1',
            'is_active' => 'boolean',
            'description' => 'nullable|string'
        ]);

        try {
            $policy->update($request->only(['retention_days', 'is_active', 'description']));
            
            return response()->json([
                'success' => true,
                'policy' => $policy,
                'message' => 'Retention policy updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update retention policy: ' . $e->getMessage()
            ], 500);
        }
    }

    public function preview(): JsonResponse
    {
        try {
            $preview = $this->retentionService->previewPurge();
            
            return response()->json([
                'success' => true,
                'preview' => $preview,
                'total_records' => collect($preview)->sum('count')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate preview: ' . $e->getMessage()
            ], 500);
        }
    }

    public function executePurge(Request $request): JsonResponse
    {
        try {
            $results = $this->retentionService->purgeExpiredData();
            
            return response()->json([
                'success' => true,
                'results' => $results,
                'total_purged' => array_sum($results),
                'message' => 'Data purge completed successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Purge failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function logs(): JsonResponse
    {
        $logs = PurgeLog::orderBy('executed_at', 'desc')
            ->paginate(50);
            
        return response()->json($logs);
    }

    public function deletePolicy(DataRetentionPolicy $policy): JsonResponse
    {
        try {
            $policy->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Retention policy deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete retention policy: ' . $e->getMessage()
            ], 500);
        }
    }
}
