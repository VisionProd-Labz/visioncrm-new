import { Metadata } from 'next';
import { BankAccountForm } from '@/components/accounting/bank-account-form';

export const metadata: Metadata = {
  title: 'Nouveau compte bancaire | VisionCRM',
  description: 'Ajouter un nouveau compte bancaire',
};

export default function NewBankAccountPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nouveau compte bancaire</h1>
        <p className="text-muted-foreground">
          Ajoutez un nouveau compte bancaire à votre comptabilité
        </p>
      </div>

      <BankAccountForm />
    </div>
  );
}
