import { Metadata } from 'next';
import Link from 'next/link';
import { Plus, Building2, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Comptes bancaires | VisionCRM',
  description: 'Gestion des comptes bancaires et rapprochement',
};

// TODO: Fetch real data from API
async function getBankAccounts() {
  // Placeholder data
  return [
    {
      id: '1',
      account_name: 'Compte courant professionnel',
      bank_name: 'Banque Populaire',
      account_number: '****1234',
      iban: 'FR76 **** **** **** **** **34',
      balance: 45230.50,
      currency: 'EUR',
      is_active: true,
      last_reconciled_at: new Date('2025-12-31'),
      _count: {
        transactions: 156,
        reconciliations: 12,
      },
    },
    {
      id: '2',
      account_name: 'Compte épargne',
      bank_name: 'Crédit Agricole',
      account_number: '****5678',
      iban: 'FR76 **** **** **** **** **78',
      balance: 25000.00,
      currency: 'EUR',
      is_active: true,
      last_reconciled_at: new Date('2025-11-30'),
      _count: {
        transactions: 24,
        reconciliations: 11,
      },
    },
  ];
}

export default async function BankReconciliationPage() {
  const accounts = await getBankAccounts();

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const activeAccounts = accounts.filter(acc => acc.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comptes bancaires</h1>
          <p className="text-muted-foreground">
            Gérez vos comptes et effectuez le rapprochement bancaire
          </p>
        </div>
        <Link href="/accounting/bank-reconciliation/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau compte
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Solde total
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              }).format(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tous comptes confondus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Comptes actifs
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAccounts}</div>
            <p className="text-xs text-muted-foreground">
              Sur {accounts.length} compte(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              À rapprocher
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {accounts.filter(acc => {
                const daysSince = Math.floor(
                  (Date.now() - new Date(acc.last_reconciled_at).getTime()) / (1000 * 60 * 60 * 24)
                );
                return daysSince > 30;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Non rapproché depuis +30j
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bank Accounts List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Vos comptes</h2>

        {accounts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun compte bancaire</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Commencez par ajouter vos comptes bancaires
              </p>
              <Link href="/accounting/bank-reconciliation/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un compte
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          accounts.map((account) => {
            const daysSinceReconciliation = Math.floor(
              (Date.now() - new Date(account.last_reconciled_at).getTime()) / (1000 * 60 * 60 * 24)
            );
            const needsReconciliation = daysSinceReconciliation > 30;

            return (
              <Card key={account.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle>{account.account_name}</CardTitle>
                        {account.is_active ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Actif
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactif</Badge>
                        )}
                        {needsReconciliation && (
                          <Badge variant="destructive" className="bg-orange-100 text-orange-800">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            À rapprocher
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        {account.bank_name} • {account.account_number}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: account.currency,
                        }).format(account.balance)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        IBAN: {account.iban}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-6 text-sm">
                      <div>
                        <p className="text-muted-foreground">Transactions</p>
                        <p className="font-medium">{account._count.transactions}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Rapprochements</p>
                        <p className="font-medium">{account._count.reconciliations}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Dernier rapprochement</p>
                        <p className="font-medium">
                          {new Date(account.last_reconciled_at).toLocaleDateString('fr-FR')}
                          <span className="text-xs text-muted-foreground ml-1">
                            ({daysSinceReconciliation}j)
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/accounting/bank-reconciliation/${account.id}/transactions`}>
                        <Button variant="outline" size="sm">
                          Transactions
                        </Button>
                      </Link>
                      <Link href={`/accounting/bank-reconciliation/${account.id}/reconcile`}>
                        <Button size="sm">
                          Rapprocher
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
