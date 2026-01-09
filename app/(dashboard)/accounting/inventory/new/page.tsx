import { Metadata } from 'next';
import { InventoryForm } from '@/components/accounting/inventory-form';

export const metadata: Metadata = {
  title: 'Nouvel article | VisionCRM',
  description: 'Ajouter un nouvel article à l\'inventaire',
};

export default function NewInventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nouvel article</h1>
        <p className="text-muted-foreground">
          Ajoutez un nouvel article à votre inventaire
        </p>
      </div>

      <InventoryForm />
    </div>
  );
}
