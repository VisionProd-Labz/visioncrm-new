import { Metadata } from 'next';
import { Building2, TrendingUp, TrendingDown, DollarSign, Receipt, Package, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Comptabilité | VisionCRM',
  description: 'Gestion comptable et financière',
};

export default async function AccountingPage() {
  // TODO: Fetch real data from API
  const stats = {
    totalRevenue: 125000,
    totalExpenses: 65000,
    netProfit: 60000,
    pendingInvoices: 12,
    pendingExpenses: 5,
    cashBalance: 45000,
    inventoryValue: 85000,
    documentsToSubmit: 3,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Comptabilité</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de votre situation financière
        </p>
      </div>

      {/* Financial Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Chiffre d'affaires
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              }).format(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Exercice en cours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dépenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              }).format(stats.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Exercice en cours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Résultat net
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              }).format(stats.netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              +{((stats.netProfit / stats.totalRevenue) * 100).toFixed(1)}% marge
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Trésorerie
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              }).format(stats.cashBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Solde des comptes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Rapprochement bancaire</CardTitle>
            </div>
            <CardDescription>
              Réconciliez vos comptes bancaires
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Dernière réconciliation</span>
              <span className="text-sm font-medium">31/12/2025</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Receipt className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Dépenses</CardTitle>
            </div>
            <CardDescription>
              Gérez vos achats et factures fournisseurs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">En attente</span>
              <span className="text-2xl font-bold text-orange-600">
                {stats.pendingExpenses}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Stock & Inventaire</CardTitle>
            </div>
            <CardDescription>
              Gérez votre inventaire de stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Valeur totale</span>
              <span className="text-sm font-medium">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                }).format(stats.inventoryValue)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Documents comptables</CardTitle>
            </div>
            <CardDescription>
              Documents fiscaux, sociaux et juridiques
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">À transmettre</span>
              <span className="text-2xl font-bold text-red-600">
                {stats.documentsToSubmit}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Ventes & CA</CardTitle>
            </div>
            <CardDescription>
              Suivi du chiffre d'affaires et factures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Factures en attente</span>
              <span className="text-2xl font-bold">
                {stats.pendingInvoices}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Rapports financiers</CardTitle>
            </div>
            <CardDescription>
              Bilans, compte de résultat, trésorerie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Dernier rapport</span>
              <span className="text-sm font-medium">Décembre 2025</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Reminders */}
      <Card>
        <CardHeader>
          <CardTitle>Alertes et rappels</CardTitle>
          <CardDescription>
            Actions comptables à réaliser
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex-shrink-0 w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-900">
                Inventaire de caisse à réaliser
              </p>
              <p className="text-sm text-orange-700">
                Effectuer l'inventaire de caisse au 31/12/2025
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">
                Documents fiscaux à transmettre
              </p>
              <p className="text-sm text-red-700">
                3 documents en attente de transmission à votre comptable
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                {stats.pendingExpenses} dépenses en attente d'approbation
              </p>
              <p className="text-sm text-blue-700">
                Vérifier et approuver les dépenses soumises
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
