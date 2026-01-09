import { Metadata } from 'next';
import Link from 'next/link';
import { Plus, Receipt, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Dépenses | VisionCRM',
  description: 'Gestion des dépenses et achats',
};

// TODO: Fetch real data from API
async function getExpenses() {
  // Placeholder data
  return {
    expenses: [
      {
        id: '1',
        expense_number: 'EXP-2025-00001',
        date: new Date('2025-12-15'),
        vendor_name: 'Fournisseur Pièces Auto',
        category: 'INVENTORY',
        description: 'Achat de pièces détachées pour stock',
        amount_ht: 1250.00,
        vat_rate: 20.0,
        vat_amount: 250.00,
        amount_ttc: 1500.00,
        status: 'APPROVED',
        payment_method: 'BANK_TRANSFER',
        receipt_url: null,
      },
      {
        id: '2',
        expense_number: 'EXP-2025-00002',
        date: new Date('2025-12-20'),
        vendor_name: 'EDF',
        category: 'UTILITIES',
        description: 'Facture électricité décembre',
        amount_ht: 450.00,
        vat_rate: 20.0,
        vat_amount: 90.00,
        amount_ttc: 540.00,
        status: 'SUBMITTED',
        payment_method: null,
        receipt_url: null,
      },
      {
        id: '3',
        expense_number: 'EXP-2025-00003',
        date: new Date('2025-12-22'),
        vendor_name: 'Restaurant Le Gourmet',
        category: 'RESTAURANT',
        description: 'Repas client - M. Dupont',
        amount_ht: 85.00,
        vat_rate: 10.0,
        vat_amount: 8.50,
        amount_ttc: 93.50,
        status: 'DRAFT',
        payment_method: 'CARD',
        receipt_url: null,
      },
    ],
    stats: {
      total: 3,
      pending: 1,
      submitted: 1,
      approved: 1,
      totalAmount: 2133.50,
    },
  };
}

const statusConfig = {
  DRAFT: { label: 'Brouillon', variant: 'secondary' as const, color: 'text-gray-600' },
  SUBMITTED: { label: 'Soumis', variant: 'default' as const, color: 'text-blue-600' },
  APPROVED: { label: 'Approuvé', variant: 'default' as const, color: 'text-green-600' },
  PAID: { label: 'Payé', variant: 'default' as const, color: 'text-purple-600' },
  REJECTED: { label: 'Rejeté', variant: 'destructive' as const, color: 'text-red-600' },
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

export default async function ExpensesPage() {
  const { expenses, stats } = await getExpenses();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dépenses</h1>
          <p className="text-muted-foreground">
            Gérez vos achats et factures fournisseurs
          </p>
        </div>
        <Link href="/accounting/expenses/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle dépense
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total dépenses
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              }).format(stats.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.total} dépense(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              En attente
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Brouillon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Soumis
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.submitted}</div>
            <p className="text-xs text-muted-foreground">
              À approuver
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Approuvés
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              Validés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Liste des dépenses</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Filtrer
            </Button>
            <Button variant="outline" size="sm">
              Exporter
            </Button>
          </div>
        </div>

        {expenses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune dépense</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Commencez par enregistrer vos dépenses
              </p>
              <Link href="/accounting/expenses/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une dépense
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {expenses.map((expense) => {
              const status = statusConfig[expense.status as keyof typeof statusConfig];
              return (
                <Card key={expense.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm text-muted-foreground">
                            {expense.expense_number}
                          </span>
                          <Badge variant={status.variant} className={status.color}>
                            {status.label}
                          </Badge>
                          <Badge variant="outline">
                            {categoryLabels[expense.category] || expense.category}
                          </Badge>
                        </div>
                        <h3 className="font-semibold">{expense.description}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{expense.vendor_name}</span>
                          <span>•</span>
                          <span>{new Date(expense.date).toLocaleDateString('fr-FR')}</span>
                          {expense.payment_method && (
                            <>
                              <span>•</span>
                              <span>{expense.payment_method}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-2xl font-bold">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                          }).format(expense.amount_ttc)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          HT: {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                          }).format(expense.amount_ht)}
                          {' '}
                          TVA: {expense.vat_rate}%
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Link href={`/accounting/expenses/${expense.id}`}>
                            <Button variant="outline" size="sm">
                              Voir
                            </Button>
                          </Link>
                          {expense.status === 'SUBMITTED' && (
                            <Button size="sm" variant="default">
                              Approuver
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
