import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileBarChart, Download, Calendar, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Rapports financiers | VisionCRM',
  description: 'Génération de rapports comptables et FEC',
};

// TODO: Fetch from API
async function getReports() {
  // Placeholder data
  const reports = [
    {
      id: '1',
      report_type: 'FEC_EXPORT',
      year: 2025,
      period: 'ANNUEL',
      created_at: new Date('2025-12-28'),
    },
    {
      id: '2',
      report_type: 'VAT_SUMMARY',
      year: 2025,
      period: 'Q4',
      created_at: new Date('2025-12-20'),
    },
    {
      id: '3',
      report_type: 'INCOME_STATEMENT',
      year: 2025,
      period: 'ANNUEL',
      created_at: new Date('2025-12-15'),
    },
  ];

  return { reports };
}

const reportTypeConfig = {
  BALANCE_SHEET: {
    label: 'Bilan',
    description: 'État de la situation financière',
    icon: TrendingUp,
  },
  INCOME_STATEMENT: {
    label: 'Compte de résultat',
    description: 'Revenus et dépenses de la période',
    icon: FileBarChart,
  },
  CASH_FLOW: {
    label: 'Tableau de flux de trésorerie',
    description: 'Mouvements de trésorerie',
    icon: TrendingUp,
  },
  VAT_SUMMARY: {
    label: 'Récapitulatif TVA',
    description: 'TVA collectée et déductible',
    icon: FileBarChart,
  },
  FEC_EXPORT: {
    label: 'Export FEC',
    description: 'Fichier des Écritures Comptables',
    icon: Download,
  },
};

export default async function ReportsPage() {
  const { reports } = await getReports();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rapports financiers</h1>
          <p className="text-muted-foreground">
            Générez et consultez vos rapports comptables
          </p>
        </div>
      </div>

      {/* Generate Report Section */}
      <Card>
        <CardHeader>
          <CardTitle>Générer un rapport</CardTitle>
          <CardDescription>
            Sélectionnez le type de rapport que vous souhaitez générer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(reportTypeConfig).map(([type, config]) => {
              const Icon = config.icon;
              return (
                <Card key={type} className="hover:bg-muted/50 cursor-pointer transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{config.label}</CardTitle>
                        <CardDescription className="text-xs">
                          {config.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" className="w-full">
                      Générer
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Rapports récents</h2>
        <div className="space-y-4">
          {reports.map((report) => {
            const config = reportTypeConfig[report.report_type as keyof typeof reportTypeConfig];
            const Icon = config.icon;

            return (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{config.label}</CardTitle>
                        <CardDescription>
                          {report.period} {report.year}
                        </CardDescription>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Généré le {new Date(report.created_at).toLocaleDateString('fr-FR')} à{' '}
                      {new Date(report.created_at).toLocaleTimeString('fr-FR')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {reports.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileBarChart className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Aucun rapport généré</p>
            <p className="text-sm text-muted-foreground mb-4">
              Générez votre premier rapport comptable
            </p>
          </CardContent>
        </Card>
      )}

      {/* Info Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">À propos du FEC</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <p className="text-sm mb-2">
            Le Fichier des Écritures Comptables (FEC) est un fichier obligatoire pour toutes les
            entreprises tenant leur comptabilité au moyen de systèmes informatisés.
          </p>
          <p className="text-sm">
            Il doit être fourni à l'administration fiscale sur demande lors d'un contrôle.
            Le format est normalisé et contient l'intégralité des écritures comptables de l'exercice.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
