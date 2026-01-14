'use client';

import { Building2, TrendingUp, TrendingDown, DollarSign, Receipt, Package, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function OverviewTab() {
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
    <div className="space-y-6">
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

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Factures en attente
            </CardTitle>
            <Receipt className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingInvoices}
            </div>
            <p className="text-xs text-muted-foreground">
              À encaisser
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Dépenses en attente
            </CardTitle>
            <Receipt className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.pendingExpenses}
            </div>
            <p className="text-xs text-muted-foreground">
              À approuver
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valeur du stock
            </CardTitle>
            <Package className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              }).format(stats.inventoryValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Inventaire actuel
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Documents urgents
            </CardTitle>
            <FileText className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.documentsToSubmit}
            </div>
            <p className="text-xs text-muted-foreground">
              À transmettre
            </p>
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
                {stats.documentsToSubmit} documents en attente de transmission à votre comptable
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
