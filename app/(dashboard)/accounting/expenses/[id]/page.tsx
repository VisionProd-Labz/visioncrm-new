import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle, XCircle, Edit, FileText, Download } from 'lucide-react';
import { ApproveExpenseButton } from '@/components/accounting/approve-expense-button';

export const metadata: Metadata = {
  title: 'Détail dépense | VisionCRM',
  description: 'Détails de la dépense',
};

// TODO: Fetch from API
async function getExpense(id: string) {
  // Placeholder data
  return {
    id,
    expense_number: 'EXP-2025-00002',
    date: new Date('2025-12-20'),
    vendor_name: 'EDF',
    vendor_id: null,
    category: 'UTILITIES',
    description: 'Facture électricité décembre 2025',
    amount_ht: 450.00,
    vat_rate: 20.0,
    vat_amount: 90.00,
    amount_ttc: 540.00,
    status: 'SUBMITTED',
    payment_method: 'BANK_TRANSFER',
    approved_by: null,
    approved_at: null,
    paid_at: null,
    notes: 'Facture mensuelle habituelle',
    receipt_url: 'https://example.com/receipt.pdf',
    created_at: new Date('2025-12-20'),
    updated_at: new Date('2025-12-20'),
  };
}

const statusConfig = {
  DRAFT: { label: 'Brouillon', variant: 'secondary' as const, icon: FileText },
  SUBMITTED: { label: 'Soumis', variant: 'default' as const, icon: FileText },
  APPROVED: { label: 'Approuvé', variant: 'default' as const, icon: CheckCircle },
  PAID: { label: 'Payé', variant: 'default' as const, icon: CheckCircle },
  REJECTED: { label: 'Rejeté', variant: 'destructive' as const, icon: XCircle },
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

const paymentMethodLabels: Record<string, string> = {
  CASH: 'Espèces',
  CARD: 'Carte bancaire',
  BANK_TRANSFER: 'Virement bancaire',
  CHECK: 'Chèque',
};

export default async function ExpenseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const expense = await getExpense(id);

  if (!expense) {
    notFound();
  }

  const status = statusConfig[expense.status as keyof typeof statusConfig];
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/accounting/expenses">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {expense.expense_number}
            </h1>
            <p className="text-muted-foreground">
              Créée le {new Date(expense.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {expense.status === 'SUBMITTED' && (
            <ApproveExpenseButton expenseId={expense.id} />
          )}
          {(expense.status === 'DRAFT' || expense.status === 'SUBMITTED') && (
            <Link href={`/accounting/expenses/${expense.id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Informations</CardTitle>
                <Badge variant={status.variant} className="flex items-center gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(expense.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fournisseur</p>
                  <p className="font-medium">{expense.vendor_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Catégorie</p>
                  <Badge variant="outline">
                    {categoryLabels[expense.category] || expense.category}
                  </Badge>
                </div>
                {expense.payment_method && (
                  <div>
                    <p className="text-sm text-muted-foreground">Moyen de paiement</p>
                    <p className="font-medium">
                      {paymentMethodLabels[expense.payment_method] || expense.payment_method}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-2">Description</p>
                <p className="text-base">{expense.description}</p>
              </div>

              {expense.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Notes</p>
                    <p className="text-sm">{expense.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          {(expense.approved_at || expense.paid_at) && (
            <Card>
              <CardHeader>
                <CardTitle>Historique</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div>
                      <p className="font-medium">Dépense créée</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(expense.created_at).toLocaleDateString('fr-FR')} à{' '}
                        {new Date(expense.created_at).toLocaleTimeString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  {expense.approved_at && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                      <div>
                        <p className="font-medium">Approuvée</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(expense.approved_at).toLocaleDateString('fr-FR')} à{' '}
                          {new Date(expense.approved_at).toLocaleTimeString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  )}

                  {expense.paid_at && (
                    <div className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                      <div>
                        <p className="font-medium">Payée</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(expense.paid_at).toLocaleDateString('fr-FR')} à{' '}
                          {new Date(expense.paid_at).toLocaleTimeString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Amounts */}
          <Card>
            <CardHeader>
              <CardTitle>Montants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Montant HT</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(expense.amount_ht)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  TVA ({expense.vat_rate}%)
                </span>
                <span className="font-medium">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(expense.vat_amount)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total TTC</span>
                <span>
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(expense.amount_ttc)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          {expense.receipt_url && (
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={expense.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm hover:underline"
                >
                  <Download className="h-4 w-4" />
                  Télécharger le justificatif
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
