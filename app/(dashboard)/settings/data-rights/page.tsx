'use client';

import { useState, useEffect } from 'react';
import { Download, Trash2, FileText, Clock, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

type RequestType = 'ACCESS' | 'RECTIFICATION' | 'ERASURE' | 'PORTABILITY' | 'RESTRICTION' | 'OBJECTION';
type RequestStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

interface DsarRequest {
  id: string;
  request_type: RequestType;
  status: RequestStatus;
  requested_at: string;
  completed_at?: string;
  data_url?: string;
  notes?: string;
}

const requestTypeLabels: Record<RequestType, { title: string; description: string; icon: typeof FileText }> = {
  ACCESS: {
    title: 'Droit d\'accès',
    description: 'Obtenir une copie de toutes vos données personnelles',
    icon: FileText,
  },
  PORTABILITY: {
    title: 'Droit à la portabilité',
    description: 'Exporter vos données dans un format structuré',
    icon: Download,
  },
  RECTIFICATION: {
    title: 'Droit de rectification',
    description: 'Corriger des données inexactes vous concernant',
    icon: FileText,
  },
  ERASURE: {
    title: 'Droit à l\'effacement',
    description: 'Supprimer définitivement votre compte et vos données',
    icon: Trash2,
  },
  RESTRICTION: {
    title: 'Droit à la limitation',
    description: 'Limiter le traitement de vos données',
    icon: FileText,
  },
  OBJECTION: {
    title: 'Droit d\'opposition',
    description: 'S\'opposer au traitement de vos données',
    icon: FileText,
  },
};

const statusLabels: Record<RequestStatus, { label: string; icon: typeof Clock; color: string }> = {
  PENDING: {
    label: 'En attente',
    icon: Clock,
    color: 'text-yellow-600',
  },
  IN_PROGRESS: {
    label: 'En cours',
    icon: Loader2,
    color: 'text-blue-600',
  },
  COMPLETED: {
    label: 'Terminé',
    icon: CheckCircle,
    color: 'text-green-600',
  },
  REJECTED: {
    label: 'Rejeté',
    icon: XCircle,
    color: 'text-red-600',
  },
};

export default function DataRightsPage() {
  const [requests, setRequests] = useState<DsarRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/rgpd/dsar/requests');
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data.requests);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger vos demandes',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);

    try {
      const response = await fetch('/api/rgpd/dsar/export', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to export data');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user_data_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Export réussi',
        description: 'Vos données ont été téléchargées avec succès',
      });

      // Refresh requests list
      fetchRequests();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible d\'exporter vos données',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);

    try {
      const response = await fetch('/api/rgpd/dsar/delete', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete account');
      }

      toast({
        title: 'Compte supprimé',
        description: 'Votre compte a été supprimé avec succès. Vous allez être déconnecté.',
      });

      // Redirect to logout after 2 seconds
      setTimeout(() => {
        window.location.href = '/api/auth/signout';
      }, 2000);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de supprimer votre compte',
      });
      setDeleting(false);
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Vos droits RGPD</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Exercez vos droits en matière de protection des données personnelles
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export Data Card */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Exporter mes données</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Téléchargez une copie complète de toutes vos données personnelles au format JSON
              </p>
            </div>
          </div>
          <Button
            onClick={handleExportData}
            disabled={exporting}
            className="w-full"
            variant="outline"
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Télécharger mes données
              </>
            )}
          </Button>
        </div>

        {/* Delete Account Card */}
        <div className="bg-card border border-destructive/50 rounded-lg p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Supprimer mon compte</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Supprimez définitivement votre compte et toutes vos données. Cette action est irréversible.
              </p>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full" disabled={deleting}>
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Suppression en cours...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer mon compte
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Confirmer la suppression
                </DialogTitle>
                <DialogDescription className="space-y-2">
                  <p>
                    Êtes-vous vraiment sûr de vouloir supprimer votre compte ?
                  </p>
                  <p className="font-semibold text-foreground">
                    Cette action est irréversible et entraînera :
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>La suppression définitive de toutes vos données personnelles</li>
                    <li>La perte d'accès à tous vos contacts, factures et documents</li>
                    <li>La déconnexion immédiate de votre compte</li>
                  </ul>
                  <p className="text-destructive font-medium mt-4">
                    Vous ne pourrez pas annuler cette action !
                  </p>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Annuler</Button>
                <Button
                  onClick={handleDeleteAccount}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Oui, supprimer mon compte
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Requests History */}
      {requests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Historique de vos demandes</h2>
          <div className="bg-card border border-border rounded-lg divide-y divide-border">
            {requests.map((request) => {
              const typeInfo = requestTypeLabels[request.request_type];
              const statusInfo = statusLabels[request.status];
              const StatusIcon = statusInfo.icon;

              return (
                <div key={request.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{typeInfo.title}</p>
                        <span className={`flex items-center gap-1 text-xs ${statusInfo.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Demandé le {new Date(request.requested_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {request.completed_at && (
                        <p className="text-sm text-muted-foreground">
                          Complété le {new Date(request.completed_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                    {request.data_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={request.data_url} download>
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Information Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Vos droits RGPD</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(requestTypeLabels).map(([type, info]) => {
            const Icon = info.icon;
            return (
              <div key={type} className="p-4 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-foreground">{info.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{info.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Help Section */}
      <div className="p-4 rounded-lg border border-blue-500/50 bg-blue-500/10">
        <p className="text-sm text-foreground">
          <strong>Besoin d'aide ?</strong> Pour toute question concernant vos données personnelles
          ou l'exercice de vos droits, contactez notre Délégué à la Protection des Données (DPO) à
          l'adresse <a href="mailto:dpo@visioncrm.com" className="underline">dpo@visioncrm.com</a>
        </p>
      </div>
    </div>
  );
}
