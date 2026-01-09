import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Scale, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contentieux | VisionCRM',
  description: 'Suivi des litiges et contentieux',
};

// TODO: Fetch from API
async function getLitigationCases() {
  // Placeholder data
  const cases = [
    {
      id: '1',
      case_number: 'LIT-2025-001',
      type: 'CLIENT_DISPUTE',
      party_name: 'Client ABC',
      subject: 'Facture impayée',
      description: 'Client conteste la facture #INV-2025-150 pour un montant de 5 000€',
      amount_disputed: 5000.00,
      provision_amount: 2000.00,
      risk_level: 'MEDIUM',
      status: 'ONGOING',
      start_date: new Date('2025-10-15'),
      lawyer_name: 'Maître Dupont',
      lawyer_fees: 1500.00,
      created_at: new Date('2025-10-15'),
    },
    {
      id: '2',
      case_number: 'LIT-2025-002',
      type: 'SUPPLIER_DISPUTE',
      party_name: 'Fournisseur XYZ',
      subject: 'Livraison non conforme',
      description: 'Contestation de la qualité des marchandises livrées',
      amount_disputed: 3000.00,
      provision_amount: 3000.00,
      risk_level: 'LOW',
      status: 'SETTLED',
      start_date: new Date('2025-09-01'),
      actual_end_date: new Date('2025-11-30'),
      lawyer_name: 'Cabinet Martin',
      lawyer_fees: 800.00,
      outcome: 'Accord amiable - Remboursement de 2 500€',
      created_at: new Date('2025-09-01'),
    },
  ];

  const stats = {
    totalCases: cases.length,
    activeCases: cases.filter(c => c.status === 'ONGOING').length,
    settledCases: cases.filter(c => c.status === 'SETTLED' || c.status === 'WON' || c.status === 'CLOSED').length,
    totalAmountDisputed: cases.reduce((sum, c) => sum + c.amount_disputed, 0),
  };

  return { cases, stats };
}

const statusConfig = {
  ONGOING: { label: 'En cours', variant: 'default' as const, icon: Clock },
  SETTLED: { label: 'Réglé', variant: 'default' as const, icon: CheckCircle },
  CLOSED: { label: 'Clôturé', variant: 'secondary' as const, icon: CheckCircle },
  WON: { label: 'Gagné', variant: 'default' as const, icon: CheckCircle },
  LOST: { label: 'Perdu', variant: 'destructive' as const, icon: XCircle },
};

const riskConfig = {
  LOW: { label: 'Faible', color: 'bg-green-100 text-green-800' },
  MEDIUM: { label: 'Moyen', color: 'bg-orange-100 text-orange-800' },
  HIGH: { label: 'Élevé', color: 'bg-red-100 text-red-800' },
};

const typeLabels: Record<string, string> = {
  CLIENT_DISPUTE: 'Litige client',
  SUPPLIER_DISPUTE: 'Litige fournisseur',
  LABOR_DISPUTE: 'Contentieux prud\'homal',
  TAX_DISPUTE: 'Contentieux fiscal',
  ADMINISTRATIVE: 'Contentieux administratif',
  COMMERCIAL: 'Contentieux commercial',
  OTHER: 'Autre',
};

export default async function LitigationPage() {
  const { cases, stats } = await getLitigationCases();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contentieux</h1>
          <p className="text-muted-foreground">
            Suivi des litiges et contentieux en cours
          </p>
        </div>
        <Link href="/accounting/litigation/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau litige
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total litiges</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCases}</div>
            <p className="text-xs text-muted-foreground">
              Tous statuts confondus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.activeCases}</div>
            <p className="text-xs text-muted-foreground">
              Nécessitent un suivi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réglés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.settledCases}</div>
            <p className="text-xs text-muted-foreground">
              Terminés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant en litige</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              }).format(stats.totalAmountDisputed)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total contesté
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Litigation List */}
      <div className="space-y-4">
        {cases.map((litigationCase) => {
          const status = statusConfig[litigationCase.status as keyof typeof statusConfig];
          const risk = riskConfig[litigationCase.risk_level as keyof typeof riskConfig];
          const StatusIcon = status.icon;

          return (
            <Card key={litigationCase.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{litigationCase.subject}</CardTitle>
                      <Badge variant={status.variant} className="flex items-center gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                      <Badge className={risk.color}>
                        {risk.label}
                      </Badge>
                    </div>
                    <CardDescription>
                      {litigationCase.case_number && `${litigationCase.case_number} • `}
                      {typeLabels[litigationCase.type] || litigationCase.type} • {litigationCase.party_name}
                    </CardDescription>
                  </div>
                  <Link href={`/accounting/litigation/${litigationCase.id}`}>
                    <Button variant="outline" size="sm">
                      Détails
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {litigationCase.description && (
                  <p className="text-sm">{litigationCase.description}</p>
                )}

                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Montant contesté</p>
                    <p className="text-lg font-semibold">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      }).format(litigationCase.amount_disputed)}
                    </p>
                  </div>
                  {litigationCase.provision_amount && (
                    <div>
                      <p className="text-sm text-muted-foreground">Provision</p>
                      <p className="text-lg font-semibold">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                        }).format(litigationCase.provision_amount)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Date de début</p>
                    <p className="font-medium">
                      {new Date(litigationCase.start_date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  {litigationCase.lawyer_name && (
                    <div>
                      <p className="text-sm text-muted-foreground">Avocat</p>
                      <p className="font-medium">{litigationCase.lawyer_name}</p>
                      {litigationCase.lawyer_fees && (
                        <p className="text-xs text-muted-foreground">
                          Honoraires: {' '}
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                          }).format(litigationCase.lawyer_fees)}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {litigationCase.outcome && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm font-medium mb-1">Issue du litige</p>
                    <p className="text-sm">{litigationCase.outcome}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {cases.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Scale className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Aucun litige enregistré</p>
            <p className="text-sm text-muted-foreground mb-4">
              Aucun contentieux en cours
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
