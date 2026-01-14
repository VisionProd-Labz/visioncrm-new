'use client';

import { useState, useEffect } from 'react';
import { Database, Trash2, Clock, CheckCircle, XCircle, Loader2, Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DataRetentionPolicy {
  id: string;
  tenant_id: string;
  entity_type: string;
  retention_days: number;
  is_active: boolean;
  last_purge_at?: string;
  created_at: string;
  updated_at: string;
}

const defaultPolicies: { entity_type: string; description: string; default_retention: number }[] = [
  { entity_type: 'contacts', description: 'Contacts inactifs', default_retention: 1095 }, // 3 years
  { entity_type: 'access_logs', description: 'Logs d\'accès', default_retention: 365 }, // 1 year
  { entity_type: 'activities', description: 'Activités', default_retention: 730 }, // 2 years
  { entity_type: 'documents', description: 'Documents', default_retention: 2555 }, // 7 years
  { entity_type: 'invoices', description: 'Factures (brouillon/annulées)', default_retention: 365 }, // 1 year
  { entity_type: 'quotes', description: 'Devis (expirés/rejetés)', default_retention: 180 }, // 6 months
  { entity_type: 'sessions', description: 'Sessions expirées', default_retention: 30 }, // 30 days
  { entity_type: 'dsar_requests', description: 'Demandes RGPD complétées', default_retention: 365 }, // 1 year
];

export default function DataRetentionPage() {
  const [policies, setPolicies] = useState<DataRetentionPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPolicy, setNewPolicy] = useState({ entity_type: '', retention_days: 365 });
  const { toast } = useToast();

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await fetch('/api/admin/data-retention');
      if (!response.ok) throw new Error('Failed to fetch policies');
      const data = await response.json();
      setPolicies(data.policies);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les politiques de rétention',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePolicy = async (policyId: string, currentStatus: boolean) => {
    setSaving(policyId);

    try {
      const response = await fetch('/api/admin/data-retention', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: policyId,
          is_active: !currentStatus,
        }),
      });

      if (!response.ok) throw new Error('Failed to update policy');

      setPolicies(prev =>
        prev.map(p =>
          p.id === policyId ? { ...p, is_active: !currentStatus } : p
        )
      );

      toast({
        title: 'Politique mise à jour',
        description: !currentStatus ? 'Politique activée' : 'Politique désactivée',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de mettre à jour la politique',
      });
    } finally {
      setSaving(null);
    }
  };

  const handleCreatePolicy = async () => {
    if (!newPolicy.entity_type || newPolicy.retention_days < 1) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs',
      });
      return;
    }

    try {
      const response = await fetch('/api/admin/data-retention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPolicy),
      });

      if (!response.ok) throw new Error('Failed to create policy');
      const createdPolicy = await response.json();

      setPolicies(prev => [...prev, createdPolicy]);
      setDialogOpen(false);
      setNewPolicy({ entity_type: '', retention_days: 365 });

      toast({
        title: 'Politique créée',
        description: 'La nouvelle politique de rétention a été créée',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de créer la politique',
      });
    }
  };

  const handleCreateDefaultPolicy = async (entityType: string, retentionDays: number) => {
    try {
      const response = await fetch('/api/admin/data-retention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_type: entityType,
          retention_days: retentionDays,
          is_active: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to create policy');
      const createdPolicy = await response.json();

      setPolicies(prev => [...prev, createdPolicy]);

      toast({
        title: 'Politique créée',
        description: `Politique créée pour ${entityType}`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de créer la politique',
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const policyMap = new Map(policies.map(p => [p.entity_type, p]));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Rétention des données</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Configurez les politiques de conservation et de purge automatique des données
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle politique
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une politique de rétention</DialogTitle>
              <DialogDescription>
                Définissez une nouvelle politique de rétention pour un type d'entité
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="entity_type">Type d'entité</Label>
                <Input
                  id="entity_type"
                  placeholder="ex: contacts, documents, etc."
                  value={newPolicy.entity_type}
                  onChange={(e) => setNewPolicy(prev => ({ ...prev, entity_type: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retention_days">Durée de rétention (jours)</Label>
                <Input
                  id="retention_days"
                  type="number"
                  min="1"
                  max="3650"
                  value={newPolicy.retention_days}
                  onChange={(e) => setNewPolicy(prev => ({ ...prev, retention_days: parseInt(e.target.value) || 365 }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreatePolicy}>
                <Save className="h-4 w-4 mr-2" />
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Policies */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Politiques configurées</h2>
        {policies.length === 0 ? (
          <div className="p-8 text-center bg-card border border-border rounded-lg">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucune politique configurée</p>
            <p className="text-sm text-muted-foreground mt-1">
              Créez des politiques pour activer la purge automatique des données
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg divide-y divide-border">
            {policies.map((policy) => {
              const isSaving = saving === policy.id;
              const defaultPolicy = defaultPolicies.find(p => p.entity_type === policy.entity_type);

              return (
                <div key={policy.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{policy.entity_type}</p>
                        {policy.is_active ? (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </span>
                        )}
                      </div>
                      {defaultPolicy && (
                        <p className="text-sm text-muted-foreground">{defaultPolicy.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Rétention: {policy.retention_days} jours
                        </span>
                        {policy.last_purge_at && (
                          <span className="flex items-center gap-1">
                            <Trash2 className="h-3 w-3" />
                            Dernière purge: {new Date(policy.last_purge_at).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <button
                          onClick={() => handleTogglePolicy(policy.id, policy.is_active)}
                          className="relative inline-flex items-center cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={policy.is_active}
                            readOnly
                            className="sr-only peer"
                          />
                          <div className={`w-11 h-6 rounded-full peer transition-colors ${
                            policy.is_active ? 'bg-primary' : 'bg-muted'
                          }`}>
                            <div className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform ${
                              policy.is_active ? 'translate-x-full' : ''
                            }`}></div>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Suggested Policies */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Politiques suggérées</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {defaultPolicies
            .filter(dp => !policyMap.has(dp.entity_type))
            .map((suggestion) => (
              <div key={suggestion.entity_type} className="p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{suggestion.entity_type}</p>
                    <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Rétention recommandée: {suggestion.default_retention} jours
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCreateDefaultPolicy(suggestion.entity_type, suggestion.default_retention)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Créer
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Information */}
      <div className="p-4 rounded-lg border border-blue-500/50 bg-blue-500/10">
        <p className="text-sm text-foreground">
          <strong>Information importante :</strong> Les politiques de rétention s'appliquent automatiquement
          lors de l'exécution du script de purge. Les données au-delà de la durée de rétention seront
          supprimées ou archivées conformément au RGPD. Certaines données (factures payées, documents légaux)
          sont exclues de la purge automatique pour des raisons de conformité comptable et légale.
        </p>
      </div>
    </div>
  );
}
