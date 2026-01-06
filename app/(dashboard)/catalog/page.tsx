'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Package, Filter, Grid3x3, List, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/language-context';
import { AddProductDialog } from '@/components/catalog/add-product-dialog';
import { CsvImportDialog } from '@/components/catalog/csv-import-dialog';

interface CatalogItem {
  id: string;
  name: string;
  reference: string;
  category: string;
  price: number;
  stock: number;
  image?: string;
}

export default function CatalogPage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCatalogItems();
  }, [searchQuery]);

  const fetchCatalogItems = async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/catalog?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch catalog items');
      }

      const data = await response.json();

      // Transform API items to component format
      const transformedItems: CatalogItem[] = data.items.map((item: any) => ({
        id: item.id,
        name: item.name,
        reference: item.reference,
        category: item.category,
        price: Number(item.price),
        stock: item.stock,
        image: item.image_url,
      }));

      setCatalogItems(transformedItems);
    } catch (error) {
      console.error('Error fetching catalog items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = catalogItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportCatalog = () => {
    // Créer un CSV avec tous les produits
    const headers = ['name', 'reference', 'category', 'price', 'stock'];
    const rows = catalogItems.map(item =>
      [item.name, item.reference, item.category, item.price, item.stock].join(',')
    );
    const csvContent = [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `catalogue_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <>
      <AddProductDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <CsvImportDialog open={csvDialogOpen} onOpenChange={setCsvDialogOpen} />

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('catalog.title')}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t('catalog.subtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setCsvDialogOpen(true)}>
              <Upload className="h-4 w-4" />
              {t('catalog.import_csv')}
            </Button>
            <Button variant="outline" className="gap-2" onClick={exportCatalog}>
              <Download className="h-4 w-4" />
              {t('catalog.export')}
            </Button>
            <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              {t('catalog.add_product')}
            </Button>
          </div>
        </div>

      {/* Filters & Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('catalog.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          {t('catalog.filters')}
        </Button>
        <div className="flex border border-border rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Catalog Items - Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer bg-card"
            >
              <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <div>
                  <h3 className="font-medium text-foreground">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">{item.reference}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 bg-muted rounded-md">{item.category}</span>
                  <span className={`text-xs ${item.stock > 10 ? 'text-green-600' : 'text-orange-600'}`}>
                    {t('catalog.stock')}: {item.stock}
                  </span>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-lg font-bold text-primary">{item.price.toFixed(2)} €</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Catalog Items - List View */}
      {viewMode === 'list' && (
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('catalog.table.reference')}</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('catalog.table.name')}</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">{t('catalog.table.category')}</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground">{t('catalog.table.price')}</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground">{t('catalog.stock')}</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/50'}>
                  <td className="p-3 text-sm font-mono">{item.reference}</td>
                  <td className="p-3 text-sm font-medium">{item.name}</td>
                  <td className="p-3 text-sm">
                    <span className="px-2 py-1 bg-muted rounded-md text-xs">{item.category}</span>
                  </td>
                  <td className="p-3 text-sm text-right font-medium">{item.price.toFixed(2)} €</td>
                  <td className="p-3 text-sm text-right">
                    <span className={item.stock > 10 ? 'text-green-600' : 'text-orange-600'}>
                      {item.stock}
                    </span>
                  </td>
                  <td className="p-3">
                    <Button variant="ghost" size="icon">
                      <Package className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{t('catalog.no_results')}</p>
        </div>
      )}
      </div>
    </>
  );
}
