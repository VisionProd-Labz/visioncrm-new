'use client';

import { TrendingUp, Download, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ReportsTab() {
  // TODO: Fetch real data from API
  const availableReports = [
    {
      id: '1',
      name: 'Compte de résultat',
      description: 'Analyse des revenus et dépenses',
      icon: TrendingUp,
      lastGenerated: new Date('2026-01-01'),
      frequency: 'Mensuel',
    },
    {
      id: '2',
      name: 'Bilan comptable',
      description: 'Actif et passif de l\'entreprise',
      icon: BarChart3,
      lastGenerated: new Date('2025-12-31'),
      frequency: 'Annuel',
    },
    {
      id: '3',
      name: 'Plan de trésorerie',
      description: 'Prévisions et flux de trésorerie',
      icon: Calendar,
      lastGenerated: new Date('2026-01-05'),
      frequency: 'Hebdomadaire',
    },
  ];

  const recentReports = [
    {
      id: '1',
      name: 'Compte de résultat - Décembre 2025',
      type: 'Compte de résultat',
      generated: new Date('2026-01-05'),
      period: 'Décembre 2025',
      size: '2.4 MB',
    },
    {
      id: '2',
      name: 'Bilan comptable - 2025',
      type: 'Bilan',
      generated: new Date('2026-01-02'),
      period: 'Exercice 2025',
      size: '1.8 MB',
    },
    {
      id: '3',
      name: 'Plan de trésorerie - S02 2026',
      type: 'Trésorerie',
      generated: new Date('2026-01-08'),
      period: 'Semaine 02',
      size: '890 KB',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rapports disponibles
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableReports.length}</div>
            <p className="text-xs text-muted-foreground">Types de rapports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rapports générés
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{recentReports.length}</div>
            <p className="text-xs text-muted-foreground">Ce mois-ci</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Dernier rapport
            </CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
            </div>
            <p className="text-xs text-muted-foreground">Plan de trésorerie</p>
          </CardContent>
        </Card>
      </div>

      {/* Generate Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Générer un rapport</CardTitle>
          <CardDescription>
            Sélectionnez le type de rapport que vous souhaitez générer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {availableReports.map((report) => {
              const Icon = report.icon;
              return (
                <Card
                  key={report.id}
                  className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-primary"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{report.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {report.frequency}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {report.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Dernier: {report.lastGenerated.toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <Button className="w-full" size="sm">
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
      <Card>
        <CardHeader>
          <CardTitle>Rapports récents</CardTitle>
          <CardDescription>
            Historique des derniers rapports générés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{report.name}</h3>
                      <Badge variant="outline">{report.type}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>Période: {report.period}</span>
                      <span>•</span>
                      <span>Généré: {report.generated.toLocaleDateString('fr-FR')}</span>
                      <span>•</span>
                      <span>Taille: {report.size}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Indicateurs clés</CardTitle>
            <CardDescription>Principaux KPIs financiers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Marge brute</span>
              <span className="text-lg font-bold text-green-600">48%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Marge nette</span>
              <span className="text-lg font-bold text-green-600">32%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">ROI</span>
              <span className="text-lg font-bold text-blue-600">15.5%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Seuil de rentabilité</span>
              <span className="text-lg font-bold">85 000 €</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prévisions</CardTitle>
            <CardDescription>Estimations pour les prochains mois</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">CA prévisionnel (janv.)</span>
              <span className="text-lg font-bold">42 500 €</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Dépenses prévues (janv.)</span>
              <span className="text-lg font-bold">28 000 €</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Résultat estimé</span>
              <span className="text-lg font-bold text-green-600">14 500 €</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Trésorerie fin janv.</span>
              <span className="text-lg font-bold">59 500 €</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
