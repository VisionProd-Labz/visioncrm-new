'use client';

import { Plus, Package, TrendingDown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function InventoryTab() {
  // TODO: Fetch real data from API
  const stats = {
    totalValue: 85000,
    totalItems: 247,
    lowStock: 12,
    outOfStock: 3,
  };

  const inventoryItems = [
    {
      id: '1',
      sku: 'BR-PAD-001',
      name: 'Plaquettes de frein avant',
      category: 'Freinage',
      quantity: 45,
      min_quantity: 20,
      unit_price: 35.50,
      total_value: 1597.50,
      status: 'ok',
    },
    {
      id: '2',
      sku: 'FL-MOT-001',
      name: 'Filtre à huile moteur',
      category: 'Filtration',
      quantity: 8,
      min_quantity: 15,
      unit_price: 12.90,
      total_value: 103.20,
      status: 'low',
    },
    {
      id: '3',
      sku: 'BA-12V-001',
      name: 'Batterie 12V 70Ah',
      category: 'Électrique',
      quantity: 0,
      min_quantity: 5,
      unit_price: 125.00,
      total_value: 0,
      status: 'out',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ok':
        return <Badge className="bg-green-100 text-green-800">En stock</Badge>;
      case 'low':
        return <Badge className="bg-orange-100 text-orange-800">Stock faible</Badge>;
      case 'out':
        return <Badge className="bg-red-100 text-red-800">Rupture</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur totale</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              }).format(stats.totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalItems} articles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articles totaux</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalItems}
            </div>
            <p className="text-xs text-muted-foreground">Références uniques</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock faible</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.lowStock}
            </div>
            <p className="text-xs text-muted-foreground">À réapprovisionner</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rupture de stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.outOfStock}
            </div>
            <p className="text-xs text-muted-foreground">Commande urgente</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Articles en stock</h2>
        <div className="flex gap-2">
          <Button variant="outline">Exporter</Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un article
          </Button>
        </div>
      </div>

      {/* Inventory List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des articles</CardTitle>
          <CardDescription>
            Gérez votre inventaire de pièces et fournitures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {inventoryItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-muted-foreground">
                        {item.sku}
                      </span>
                      {getStatusBadge(item.status)}
                    </div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                </div>

                <div className="text-right space-y-1 min-w-[200px]">
                  <div className="flex items-center justify-between gap-8">
                    <div>
                      <p className="text-xs text-muted-foreground">Quantité</p>
                      <p className={`text-lg font-bold ${
                        item.status === 'out' ? 'text-red-600' :
                        item.status === 'low' ? 'text-orange-600' :
                        'text-foreground'
                      }`}>
                        {item.quantity} / {item.min_quantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Valeur</p>
                      <p className="text-lg font-bold">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                        }).format(item.total_value)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm">
                      Ajuster
                    </Button>
                    {(item.status === 'low' || item.status === 'out') && (
                      <Button size="sm">Commander</Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
