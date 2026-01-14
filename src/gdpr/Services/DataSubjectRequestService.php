<?php

namespace App\GDPR\Services;

use App\GDPR\Models\DataSubjectRequest;
use App\Models\User;
use App\GDPR\Services\DataExportService;
use App\GDPR\Services\DataErasureService;
use App\Mail\GDPR\RequestVerificationMail;
use App\Mail\GDPR\RequestProcessedMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DataSubjectRequestService
{
    protected $exportService;
    protected $erasureService;

    public function __construct(DataExportService $exportService, DataErasureService $erasureService)
    {
        $this->exportService = $exportService;
        $this->erasureService = $erasureService;
    }

    public function submitRequest(array $data, ?User $user = null)
    {
        $verificationToken = Str::random(64);
        $verificationExpires = Carbon::now()->addHours(48);

        $request = DataSubjectRequest::create([
            'user_id' => $user?->id,
            'request_type' => $data['request_type'],
            'description' => $data['description'] ?? null,
            'submitted_at' => Carbon::now(),
            'verification_token' => $verificationToken,
            'verification_expires_at' => $verificationExpires,
            'request_data' => $this->sanitizeRequestData($data),
            'status' => 'pending_verification'
        ]);

        // Envoyer l'email de vérification
        $email = $user?->email ?? $data['email'];
        if ($email) {
            Mail::to($email)->send(new RequestVerificationMail($request, $verificationToken));
        }

        return $request;
    }

    public function verifyRequest(string $token)
    {
        $request = DataSubjectRequest::where('verification_token', $token)
                                   ->where('verification_expires_at', '>', Carbon::now())
                                   ->where('is_verified', false)
                                   ->first();

        if (!$request) {
            throw new \Exception('Token de vérification invalide ou expiré.');
        }

        $request->update([
            'is_verified' => true,
            'status' => 'verified',
            'verification_token' => null,
            'verification_expires_at' => null
        ]);

        return $request;
    }

    public function processRequest(DataSubjectRequest $request, array $data, User $processor)
    {
        $oldStatus = $request->status;
        
        $request->update([
            'status' => $data['status'],
            'processing_notes' => $data['processing_notes'] ?? $request->processing_notes,
            'processor_id' => $processor->id,
            'processed_at' => $oldStatus !== 'in_progress' && $data['status'] === 'in_progress' 
                ? Carbon::now() : $request->processed_at,
            'completed_at' => $data['status'] === 'completed' 
                ? Carbon::now() : null
        ]);

        // Traitement automatique selon le type de demande
        if ($data['status'] === 'completed') {
            $this->executeRequest($request);
        }

        // Notifier l'utilisateur
        if ($request->user && in_array($data['status'], ['completed', 'rejected'])) {
            Mail::to($request->user->email)->send(new RequestProcessedMail($request));
        }

        return $request;
    }

    protected function executeRequest(DataSubjectRequest $request)
    {
        switch ($request->request_type) {
            case 'access':
                // Les données sont exportées à la demande via le contrôleur
                break;
                
            case 'erasure':
                if ($request->user) {
                    $this->erasureService->eraseUserData($request->user, $request->request_data);
                }
                break;
                
            case 'portability':
                // Générer et stocker l'export pour téléchargement
                if ($request->user) {
                    $exportPath = $this->exportService->generatePortabilityExport($request->user);
                    $request->update([
                        'attachments' => ['export_path' => $exportPath]
                    ]);
                }
                break;
                
            case 'restriction':
                if ($request->user) {
                    $this->applyProcessingRestriction($request->user, $request->request_data);
                }
                break;
                
            case 'rectification':
                if ($request->user && isset($request->request_data['corrections'])) {
                    $this->applyDataCorrections($request->user, $request->request_data['corrections']);
                }
                break;
                
            case 'objection':
                if ($request->user) {
                    $this->processObjection($request->user, $request->request_data);
                }
                break;
        }
    }

    protected function applyProcessingRestriction(User $user, ?array $requestData)
    {
        // Implémenter la logique de restriction du traitement
        $restrictions = $requestData['restrictions'] ?? [];
        
        // Exemple : marquer certaines données comme restreintes
        foreach ($restrictions as $restriction) {
            // Logique spécifique selon le type de restriction
        }
    }

    protected function applyDataCorrections(User $user, array $corrections)
    {
        // Appliquer les corrections demandées
        foreach ($corrections as $field => $newValue) {
            if (in_array($field, ['name', 'email', 'phone'])) {
                $user->update([$field => $newValue]);
            }
        }
    }

    protected function processObjection(User $user, ?array $requestData)
    {
        // Traiter l'objection (ex: désabonnement marketing)
        $objections = $requestData['objections'] ?? [];
        
        foreach ($objections as $objection) {
            switch ($objection) {
                case 'marketing':
                    $user->update(['marketing_consent' => false]);
                    break;
                case 'profiling':
                    $user->update(['profiling_consent' => false]);
                    break;
            }
        }
    }

    public function exportUserData(DataSubjectRequest $request)
    {
        if ($request->request_type !== 'access' || !$request->user) {
            throw new \Exception('Export non autorisé.');
        }

        return $this->exportService->exportUserData($request->user);
    }

    protected function sanitizeRequestData(array $data)
    {
        // Nettoyer et sécuriser les données de la demande
        $sanitized = [];
        
        $allowedFields = [
            'email', 'corrections', 'restrictions', 'objections', 
            'specific_data', 'reason', 'contact_info'
        ];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $sanitized[$field] = $data[$field];
            }
        }

        return $sanitized;
    }

    public function getRequestStats()
    {
        return [
            'total' => DataSubjectRequest::count(),
            'pending' => DataSubjectRequest::where('status', 'pending_verification')->count(),
            'in_progress' => DataSubjectRequest::where('status', 'in_progress')->count(),
            'completed' => DataSubjectRequest::where('status', 'completed')->count(),
            'by_type' => DataSubjectRequest::selectRaw('request_type, count(*) as count')
                                         ->groupBy('request_type')
                                         ->pluck('count', 'request_type')
                                         ->toArray()
        ];
    }
}
