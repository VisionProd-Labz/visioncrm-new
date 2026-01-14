<?php

namespace App\GDPR\Services;

use App\Models\User;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class DataExportService
{
    public function exportUserData(User $user)
    {
        $userData = $this->collectUserData($user);
        $filename = "user_data_{$user->id}_" . date('Y-m-d_H-i-s') . '.json';
        $path = "exports/gdpr/{$filename}";

        Storage::put($path, json_encode($userData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        return Storage::download($path, $filename, [
            'Content-Type' => 'application/json'
        ]);
    }

    public function generatePortabilityExport(User $user)
    {
        $userData = $this->collectUserData($user, true);
        $filename = "portability_export_{$user->id}_" . date('Y-m-d_H-i-s') . '.zip';
        $zipPath = storage_path("app/exports/gdpr/{$filename}");

        // Créer le répertoire si nécessaire
        if (!file_exists(dirname($zipPath))) {
            mkdir(dirname($zipPath), 0755, true);
        }

        $zip = new ZipArchive();
        if ($zip->open($zipPath, ZipArchive::CREATE) === TRUE) {
            // Ajouter les données JSON
            $zip->addFromString('user_data.json', 
                json_encode($userData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

            // Ajouter d'autres fichiers si nécessaire (photos de profil, etc.)
            if ($user->avatar) {
                $avatarPath = storage_path("app/public/{$user->avatar}");
                if (file_exists($avatarPath)) {
                    $zip->addFile($avatarPath, 'avatar/' . basename($user->avatar));
                }
            }

            $zip->close();
        }

        return "exports/gdpr/{$filename}";
    }

    protected function collectUserData(User $user, $portable = false)
    {
        $data = [
            'personal_information' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'created_at' => $user->created_at->toISOString(),
                'updated_at' => $user->updated_at->toISOString(),
            ],
            'preferences' => [
                'marketing_consent' => $user->marketing_consent ?? false,
                'profiling_consent' => $user->profiling_consent ?? false,
                'newsletter_subscription' => $user->newsletter_subscription ?? false,
            ]
        ];

        // Ajouter les données CRM si disponibles
        if ($user->contacts()->exists()) {
            $data['crm_contacts'] = $user->contacts()
                ->select(['name', 'email', 'phone', 'company', 'created_at'])
                ->get()
                ->toArray();
        }

        if ($user->deals()->exists()) {
            $data['deals'] = $user->deals()
                ->select(['title', 'amount', 'status', 'created_at'])
                ->get()
                ->toArray();
        }

        // Ajouter les logs d'activité
        if (class_exists('\App\Models\ActivityLog')) {
            $data['activity_logs'] = \App\Models\ActivityLog::where('user_id', $user->id)
                ->select(['action', 'description', 'created_at'])
                ->limit(1000) // Limiter pour éviter des exports trop volumineux
                ->get()
                ->toArray();
        }

        // Pour l'export de portabilité, structurer différemment
        if ($portable) {
            $data['export_info'] = [
                'generated_at' => now()->toISOString(),
                'format_version' => '1.0',
                'type' => 'portability_export'
            ];
        }

        return $data;
    }
}
