import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Package, MapPin, TrendingDown, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Détail article | VisionCRM',
  description: 'Détails de l\'article',
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
    total_value: 15000.00,
    reorder_point: 0,
    location: 'Garage principal',
    depreciation_rate: 20.0,
    depreciated_value: 12000.00,
    last_counted_at: new Date('2025-12-01'),
    last_counted_by: null,
    notes: 'Immatriculé AA-123-BB. Entretien annuel prévu en mars.',
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-12-01'),
  };
}

export default async function InventoryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const item = await getInventoryItem(params.id);

  if (!item) {
    notFound();
  }

  const isLowStock = item.quantity <= item.reorder_point;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/accounting/inventory">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {item.name}
            </h1>
            <p className="text-muted-foreground">
              SKU: {item.sku}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/accounting/inventory/${item.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Informations générales</CardTitle>
                <Badge variant="outline">{item.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">SKU</p>
                  <p className="font-medium">{item.sku}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Catégorie</p>
                  <p className="font-medium">{item.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantité</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold">{item.quantity}</p>
                    {isLowStock && (
                      <Badge variant="destructive">Stock faible</Badge>
                    )}
                  </div>
                  {item.reorder_point > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Seuil de réapprovisionnement: {item.reorder_point}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Emplacement</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{item.location || 'Non défini'}</p>
                  </div>
                </div>
              </div>

              {item.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Description</p>
                    <p className="text-base">{item.description}</p>
                  </div>
                </>
              )}

              {item.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Notes</p>
                    <p className="text-sm">{item.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Historique</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="font-medium">Article créé</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString('fr-FR')} à{' '}
                      {new Date(item.created_at).toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                </div>

                {item.last_counted_at && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    <div>
                      <p className="font-medium">Dernier comptage</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.last_counted_at).toLocaleDateString('fr-FR')} à{' '}
                        {new Date(item.last_counted_at).toLocaleTimeString('fr-FR')}
                      </p>
                    </div>
                  </div>
                )}

                {item.updated_at && item.updated_at > item.created_at && (
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                    <div>
                      <p className="font-medium">Dernière modification</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.updated_at).toLocaleDateString('fr-FR')} à{' '}
                        {new Date(item.updated_at).toLocaleTimeString('fr-FR')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial Info */}
          <Card>
            <CardHeader>
              <CardTitle>Valeurs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Coût unitaire</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(item.unit_cost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantité</span>
                <span className="font-medium">{item.quantity}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Valeur totale</span>
                <span>
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(item.total_value)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Depreciation */}
          {item.depreciation_rate && item.depreciated_value && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  <CardTitle>Amortissement</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taux annuel</span>
                  <span className="font-medium">{item.depreciation_rate}%</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Valeur amortie</span>
                  <span>
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    }).format(item.depreciated_value)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Perte de valeur: {' '}
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(item.total_value - item.depreciated_value)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Stock Alert */}
          {isLowStock && (
            <Card className="border-orange-500">
              <CardHeader>
                <CardTitle className="text-orange-500">Alerte stock</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  La quantité actuelle ({item.quantity}) est inférieure ou égale au seuil de réapprovisionnement ({item.reorder_point}).
                </p>
                <Button className="w-full mt-4" variant="outline">
                  Commander
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
