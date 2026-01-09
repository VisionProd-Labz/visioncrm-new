import { Metadata } from 'next';
import { ExpenseForm } from '@/components/accounting/expense-form';

export const metadata: Metadata = {
  title: 'Nouvelle dépense | VisionCRM',
  description: 'Enregistrer une nouvelle dépense',
};

export default function NewExpensePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nouvelle dépense</h1>
        <p className="text-muted-foreground">
          Enregistrez une nouvelle dépense ou facture fournisseur
        </p>
      </div>

      <ExpenseForm />
    </div>
  );
}
