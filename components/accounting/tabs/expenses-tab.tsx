'use client';

import { Plus, Receipt, TrendingUp, Clock, CheckCircle, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export function ExpensesTab() {
  // TODO: Fetch real data from API
  const expenses = [
    {
      id: '1',
      expense_number: 'EXP-2025-00001',
      date: new Date('2025-12-15'),
      vendor_name: 'Fournisseur Pièces Auto',
      category: 'INVENTORY',
      description: 'Achat de pièces détachées pour stock',
      amount_ht: 1250.0,
      vat_rate: 20.0,
      vat_amount: 250.0,
      amount_ttc: 1500.0,
      status: 'APPROVED',
      payment_method: 'BANK_TRANSFER',
    },
    {
      id: '2',
      expense_number: 'EXP-2025-00002',
      date: new Date('2025-12-20'),
      vendor_name: 'EDF',
      category: 'UTILITIES',
      description: 'Facture électricité décembre',
      amount_ht: 450.0,
      vat_rate: 20.0,
      vat_amount: 90.0,
      amount_ttc: 540.0,
      status: 'SUBMITTED',
      payment_method: null,
    },
    {
      id: '3',
      expense_number: 'EXP-2025-00003',
      date: new Date('2025-12-22'),
      vendor_name: 'Restaurant Le Gourmet',
      category: 'RESTAURANT',
      description: 'Repas client - M. Dupont',
      amount_ht: 85.0,
      vat_rate: 10.0,
      vat_amount: 8.5,
      amount_ttc: 93.5,
      status: 'DRAFT',
      payment_method: 'CARD',
    },
  ];

  const stats = {
    total: 3,
    pending: 1,
    submitted: 1,
    approved: 1,
    totalAmount: 2133.5,
  };

  const statusConfig = {
    DRAFT: { label: 'Brouillon', color: 'bg-gray-100 text-gray-800' },
    SUBMITTED: { label: 'Soumis', color: 'bg-blue-100 text-blue-800' },
    APPROVED: { label: 'Approuvé', color: 'bg-green-100 text-green-800' },
    PAID: { label: 'Payé', color: 'bg-purple-100 text-purple-800' },
    REJECTED: { label: 'Rejeté', color: 'bg-red-100 text-red-800' },
  };

  const categoryLabels: Record<string, string> = {
    RENT: 'Loyer',
    UTILITIES: 'Charges',
    INSURANCE: 'Assurance',
    OFFICE_SUPPLIES: 'Fournitures',
    MAINTENANCE: 'Entretien',
    FUEL: 'Carburant',
    VEHICLE: 'Véhicule',
    MARKETING: 'Marketing',
    SALARIES: 'Salaires',
    TAXES: 'Impôts',
    RESTAURANT: 'Restaurant',
    TRAVEL: 'Déplacement',
    EQUIPMENT: 'Équipement',
    SOFTWARE: 'Logiciel',
    PROFESSIONAL_FEES: 'Honoraires',
    BANK_FEES: 'Frais bancaires',
    INVENTORY: 'Stock',
    OTHER: 'Autre',
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total dépenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              }).format(stats.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">{stats.total} dépense(s)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Brouillon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Soumis</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.submitted}</div>
            <p className="text-xs text-muted-foreground">À approuver</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approuvés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Validés</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une dépense..."
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <Link href="/accounting/expenses/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle dépense
          </Button>
        </Link>
      </div>

      {/* Expenses List */}
      <div className="space-y-3">
        {expenses.map((expense) => {
          const status = statusConfig[expense.status as keyof typeof statusConfig];
          return (
            <Card key={expense.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-muted-foreground">
                        {expense.expense_number}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {categoryLabels[expense.category] || expense.category}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-base">{expense.description}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{expense.vendor_name}</span>
                      <span>•</span>
                      <span>{new Date(expense.date).toLocaleDateString('fr-FR')}</span>
                      {expense.payment_method && (
                        <>
                          <span>•</span>
                          <span className="capitalize">
                            {expense.payment_method.replace('_', ' ').toLowerCase()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="text-2xl font-bold">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      }).format(expense.amount_ttc)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      HT:{' '}
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      }).format(expense.amount_ht)}{' '}
                      • TVA: {expense.vat_rate}%
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Link href={`/accounting/expenses/${expense.id}`}>
                        <Button variant="outline" size="sm">
                          Voir
                        </Button>
                      </Link>
                      {expense.status === 'SUBMITTED' && (
                        <Button size="sm">Approuver</Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
