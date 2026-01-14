'use client';

import { Plus, Building2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function BankTab() {
  // TODO: Fetch real data from API
  const accounts = [
    {
      id: '1',
      name: 'Compte Professionnel Principal',
      bank: 'BNP Paribas',
      account_number: 'FR76 3000 6000 0112 3456 7890 189',
      balance: 45230.50,
      last_reconciliation: new Date('2025-12-31'),
      pending_transactions: 3,
    },
    {
      id: '2',
      name: 'Compte Épargne Pro',
      bank: 'Crédit Agricole',
      account_number: 'FR76 1820 6000 0445 6789 0123 456',
      balance: 125000.00,
      last_reconciliation: new Date('2025-12-31'),
      pending_transactions: 0,
    },
  ];

  const recentTransactions = [
    {
      id: '1',
      date: new Date('2026-01-10'),
      description: 'Virement - Facture #INV-2025-001',
      amount: 2500.00,
      type: 'CREDIT',
      reconciled: true,
    },
    {
      id: '2',
      date: new Date('2026-01-09'),
      description: 'Prélèvement - EDF',
      amount: -540.00,
      type: 'DEBIT',
      reconciled: true,
    },
    {
      id: '3',
      date: new Date('2026-01-08'),
      description: 'Virement - Salaire Employé',
      amount: -3200.00,
      type: 'DEBIT',
      reconciled: false,
    },
  ];

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-6">
      {/* Total Balance */}
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardHeader>
          <CardDescription className="text-blue-100">
            Solde total des comptes
          </CardDescription>
          <CardTitle className="text-4xl font-bold">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            }).format(totalBalance)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-blue-100">
            <span>{accounts.length} compte(s) actif(s)</span>
            <span>•</span>
            <span>Dernière synchro: Aujourd'hui</span>
          </div>
        </CardContent>
      </Card>

      {/* Bank Accounts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Comptes bancaires</h2>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un compte
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {accounts.map((account) => (
            <Card key={account.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{account.name}</CardTitle>
                    <CardDescription>{account.bank}</CardDescription>
                  </div>
                  {account.pending_transactions > 0 ? (
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {account.pending_transactions} non rapproché(s)
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      <Check className="h-3 w-3 mr-1" />
                      À jour
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Numéro de compte</p>
                  <p className="font-mono text-sm">{account.account_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Solde</p>
                  <p className="text-2xl font-bold">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(account.balance)}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    Dernier rapprochement: {account.last_reconciliation.toLocaleDateString('fr-FR')}
                  </span>
                  <Button variant="outline" size="sm">
                    Rapprocher
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Dernières transactions</CardTitle>
          <CardDescription>
            Transactions récentes sur vos comptes bancaires
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    transaction.type === 'CREDIT'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.date.toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-semibold ${
                    transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(transaction.amount)}
                  </span>
                  {transaction.reconciled ? (
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      <Check className="h-3 w-3" />
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      <AlertCircle className="h-3 w-3" />
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
