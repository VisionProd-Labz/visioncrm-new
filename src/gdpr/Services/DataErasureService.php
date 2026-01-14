<?php

namespace App\GDPR\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class DataErasureService
{
    public function eraseUserData(User $user, ?array $requestData = null)
    {
        DB::transaction(function () use ($user, $requestData) {
            // Anonymiser les données obligatoires à conserver pour des raisons légales
            $this->anonymizeUser($user);

            // Supprimer les données non essentielles
            $this->deleteNonEssentialData($user, $requestData);

            // Marquer le compte comme supprimé
            $user->update([
                'deleted_at' => now(),
                'erasure_completed_at' => now()
            ]);
        });
    }

    protected function anonymizeUser(User $user)
    {
        $anonymizedData = [
            'name' => 'Utilisateur anonyme #' . $user->id,
            'email' => 'anonyme_' . $user->id . '@deleted.local',
            'phone' => null,
            'avatar' => null,
            'marketing_consent' => false,
            'profiling_consent' => false,
            'newsletter_subscription' => false
        ];

        $user->update($anonymizedData);
    }

    protected function deleteNonEssentialData(User $user, ?array $requestData)
    {
        // Supprimer les contacts CRM (sauf si demande spécifique de conservation)
        if (!$this->shouldPreserve('contacts', $requestData)) {
            $user->contacts()->delete();
        }

        // Supprimer les logs d'activité (sauf les derniers mois pour audit)
        if (class_exists('\App\Models\ActivityLog')) {
            \App\Models\ActivityLog::where('user_id', $user->id)
                ->where('created_at', '<', now()->subMonths(6))
                ->delete();
        }

        // Supprimer les fichiers uploadés
        if ($user->avatar) {
            Storage::delete('public/' . $user->avatar);
        }

        // Supprimer les données de session
        DB::table('sessions')->where('user_id', $user->id)->delete();
    }

    protected function shouldPreserve(string $dataType, ?array $requestData): bool
    {
        if (!$requestData || !isset($requestData['preserve'])) {
            return false;
        }

        return in_array($dataType, $requestData['preserve']);
    }

    public function canEraseUser(User $user): array
    {
        $restrictions = [];

        // Vérifier les contraintes légales
        if ($this->hasLegalObligations($user)) {
            $restrictions[] = 'Des obligations légales requièrent la conservation de certaines données.';
        }

        // Vérifier les contrats en cours
        if ($this->hasActiveContracts($user)) {
            $restrictions[] = 'L\'utilisateur a des contrats ou transactions en cours.';
        }

        // Vérifier les dettes ou créances
        if ($this->hasFinancialObligations($user)) {
            $restrictions[] = 'Des obligations financières sont en cours.';
        }

        return $restrictions;
    }

    protected function hasLegalObligations(User $user): bool
    {
        // Logique pour vérifier les obligations légales
        // Ex: factures à conserver, déclarations fiscales, etc.
        return false; // À implémenter selon les besoins spécifiques
    }

    protected function hasActiveContracts(User $user): bool
    {
        // Vérifier les contrats actifs
        return false; // À implémenter
    }

    protected function hasFinancialObligations(User $user): bool
    {
        // Vérifier les obligations financières
        return false; // À implémenter
    }
}
