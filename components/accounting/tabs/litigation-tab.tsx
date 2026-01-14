'use client';

import { Plus, Scale, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function LitigationTab() {
  // TODO: Fetch real data from API
  const stats = {
    total: 5,
    open: 2,
    inProgress: 1,
    resolved: 2,
    totalAmount: 12500,
  };

  const litigations = [
    {
      id: '1',
      case_number: 'LIT-2025-001',
      title: 'Facture impayée - ABC Motors',
      client_name: 'ABC Motors SARL',
      amount: 4500,
      status: 'open',
      opened_date: new Date('2025-11-15'),
      due_date: new Date('2026-02-15'),
      priority: 'high',
      type: 'invoice',
    },
    {
      id: '2',
      case_number: 'LIT-2025-002',
      title: 'Contestation facture - XYZ Auto',
      client_name: 'XYZ Auto',
      amount: 2800,
      status: 'in_progress',
      opened_date: new Date('2025-12-01'),
      due_date: new Date('2026-01-20'),
      priority: 'medium',
      type: 'dispute',
    },
    {
      id: '3',
      case_number: 'LIT-2025-003',
      title: 'Créance irrécouvrable - Garage Martin',
      client_name: 'Garage Martin',
      amount: 1200,
      status: 'resolved',
      opened_date: new Date('2025-09-10'),
      closed_date: new Date('2025-12-28'),
      priority: 'low',
      type: 'bad_debt',
    },
  ];

  const statusConfig = {
    open: { label: 'Ouvert', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
    in_progress: { label: 'En cours', color: 'bg-blue-100 text-blue-800', icon: Clock },
    resolved: { label: 'Résolu', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    closed: { label: 'Clôturé', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
  };

  const priorityConfig = {
    high: { label: 'Élevée', color: 'text-red-600' },
    medium: { label: 'Moyenne', color: 'text-orange-600' },
    low: { label: 'Faible', color: 'text-gray-600' },
  };

  const typeLabels: Record<string, string> = {
    invoice: 'Facture impayée',
    dispute: 'Contestation',
    bad_debt: 'Créance irrécouvrable',
    other: 'Autre',
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contentieux totaux</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Dossiers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ouverts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.open}</div>
            <p className="text-xs text-muted-foreground">À traiter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">En traitement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant total</CardTitle>
            <Scale className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              }).format(stats.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">En jeu</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Dossiers de contentieux</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau contentieux
        </Button>
      </div>

      {/* Litigations List */}
      <div className="space-y-3">
        {litigations.map((litigation) => {
          const status = statusConfig[litigation.status as keyof typeof statusConfig];
          const priority = priorityConfig[litigation.priority as keyof typeof priorityConfig];
          const StatusIcon = status.icon;

          return (
            <Card key={litigation.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-muted-foreground">
                        {litigation.case_number}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                        <StatusIcon className="h-3 w-3 inline mr-1" />
                        {status.label}
                      </span>
                      <Badge variant="outline">
                        {typeLabels[litigation.type]}
                      </Badge>
                      <span className={`text-xs font-semibold ${priority.color}`}>
                        Priorité: {priority.label}
                      </span>
                    </div>

                    <h3 className="font-semibold text-lg">{litigation.title}</h3>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Client: {litigation.client_name}</span>
                      <span>•</span>
                      <span>
                        Ouvert: {litigation.opened_date.toLocaleDateString('fr-FR')}
                      </span>
                      {litigation.status !== 'resolved' && litigation.due_date && (
                        <>
                          <span>•</span>
                          <span>
                            Échéance: {litigation.due_date.toLocaleDateString('fr-FR')}
                          </span>
                        </>
                      )}
                      {litigation.closed_date && (
                        <>
                          <span>•</span>
                          <span>
                            Clôturé: {litigation.closed_date.toLocaleDateString('fr-FR')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right space-y-2 min-w-[150px]">
                    <div className="text-2xl font-bold text-red-600">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      }).format(litigation.amount)}
                    </div>
                    <div className="flex gap-2 justify-end mt-3">
                      <Button variant="outline" size="sm">
                        Détails
                      </Button>
                      {litigation.status !== 'resolved' && (
                        <Button size="sm">Action</Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">
            Gestion des contentieux
          </CardTitle>
          <CardDescription className="text-blue-700">
            Bonnes pratiques pour gérer vos contentieux
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-blue-900">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
            <p>
              <strong>Relances:</strong> Effectuez des relances régulières avant d'ouvrir un contentieux
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
            <p>
              <strong>Documentation:</strong> Conservez tous les échanges et preuves de livraison
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
            <p>
              <strong>Conseil juridique:</strong> Consultez un avocat pour les montants importants
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
