import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, PackageSearch, AlertTriangle, TrendingDown } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Inventaire | VisionCRM',
  description: 'Gestion du stock et inventaire',
};

// TODO: Fetch from API
async function getInventory() {
  // Placeholder data
  const items = [
    {
      id: '1',
      sku: 'VEH-2025-001',
      name: 'Renault Kangoo',
      description: 'Véhicule utilitaire',
      category: 'VEHICULES',
      quantity: 1,
      unit_cost: 15000.00,
      total_value: 15000.00,
      reorder_point: 0,
      location: 'Garage principal',
      depreciation_rate: 20.0,
      depreciated_value: 12000.00,
      last_counted_at: new Date('2025-12-01'),
    },
    {
      id: '2',
      sku: 'PROD-2025-001',
      name: 'Peinture blanche 10L',
      description: 'Peinture acrylique blanche',
      category: 'MARCHANDISES',
      quantity: 45,
      unit_cost: 25.00,
      total_value: 1125.00,
      reorder_point: 20,
      location: 'Entrepôt A - Rayon 3',
      depreciation_rate: null,
      depreciated_value: null,
      last_counted_at: new Date('2025-12-15'),
    },
    {
      id: '3',
      sku: 'PROD-2025-002',
      name: 'Rouleau de peinture',
      description: 'Rouleau professionnel',
      category: 'MARCHANDISES',
      quantity: 8,
      unit_cost: 5.50,
      total_value: 44.00,
      reorder_point: 15,
      location: 'Entrepôt A - Rayon 1',
      depreciation_rate: null,
      depreciated_value: null,
      last_counted_at: new Date('2025-12-15'),
    },
  ];

  const stats = {
    totalItems: items.length,
    totalValue: items.reduce((sum, item) => sum + item.total_value, 0),
    lowStockItems: items.filter(item => item.quantity <= item.reorder_point).length,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
  };

  return { items, stats };
}

export default async function InventoryPage() {
  const { items, stats } = await getInventory();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventaire</h1>
          <p className="text-muted-foreground">
            Gestion du stock et des articles
          </p>
        </div>
        <Link href="/accounting/inventory/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvel article
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total articles</CardTitle>
            <PackageSearch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalQuantity} unités
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur totale</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              }).format(stats.totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Stock actuel
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock faible</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {stats.lowStockItems}
            </div>
            <p className="text-xs text-muted-foreground">
              Articles à commander
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Catégories</CardTitle>
            <PackageSearch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Types d'articles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory List */}
      <div className="space-y-4">
        {items.map((item) => {
          const isLowStock = item.quantity <= item.reorder_point;

          return (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{item.name}</CardTitle>
                      {isLowStock && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Stock faible
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      SKU: {item.sku} • {item.category}
                    </CardDescription>
                  </div>
                  <Link href={`/accounting/inventory/${item.id}`}>
                    <Button variant="outline" size="sm">
                      Détails
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Quantité</p>
                    <p className="text-lg font-semibold">
                      {item.quantity} {item.quantity > 1 ? 'unités' : 'unité'}
                    </p>
                    {item.reorder_point > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Seuil: {item.reorder_point}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Coût unitaire</p>
                    <p className="text-lg font-semibold">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      }).format(item.unit_cost)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valeur totale</p>
                    <p className="text-lg font-semibold">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      }).format(item.total_value)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Emplacement</p>
                    <p className="text-sm font-medium">{item.location || 'Non défini'}</p>
                    {item.last_counted_at && (
                      <p className="text-xs text-muted-foreground">
                        Compté le {new Date(item.last_counted_at).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                </div>
                {item.description && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
                {item.depreciation_rate && item.depreciated_value && (
                  <div className="mt-4 rounded-lg bg-muted p-3">
                    <p className="text-sm font-medium">
                      Valeur après amortissement ({item.depreciation_rate}%): {' '}
                      <span className="font-bold">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                        }).format(item.depreciated_value)}
                      </span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {items.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PackageSearch className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Aucun article dans l'inventaire</p>
            <p className="text-sm text-muted-foreground mb-4">
              Commencez par ajouter vos premiers articles
            </p>
            <Link href="/accounting/inventory/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un article
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
