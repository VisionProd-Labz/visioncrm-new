import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InventoryForm } from '@/components/accounting/inventory-form';

export const metadata: Metadata = {
  title: 'Modifier article | VisionCRM',
  description: 'Modifier un article de l\'inventaire',
};

// TODO: Fetch from API
async function getInventoryItem(id: string) {
  // Placeholder data
  return {
    id,
    sku: 'VEH-2025-001',
    name: 'Renault Kangoo',
    description: 'Véhicule utilitaire pour les déplacements professionnels',
    category: 'VEHICULES',
    quantity: 1,
    unit_cost: 15000.00,
    reorder_point: 0,
    location: 'Garage principal',
    depreciation_rate: 20.0,
    notes: 'Immatriculé AA-123-BB. Entretien annuel prévu en mars.',
  };
}

export default async function EditInventoryPage({
  params,
}: {
  params: { id: string };
}) {
  const item = await getInventoryItem(params.id);

  if (!item) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Modifier l'article</h1>
        <p className="text-muted-foreground">
          {item.name} (SKU: {item.sku})
        </p>
      </div>

      <InventoryForm initialData={item} isEditing />
    </div>
  );
}
