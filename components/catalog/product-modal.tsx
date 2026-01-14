'use client';

import { useState, useEffect } from 'react';
import { X, Package, Upload, Image as ImageIcon, DollarSign, Tag, Barcode, Box, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CatalogItem {
  id: string;
  name: string;
  reference: string;
  description?: string;
  category: string;
  price: number;
  cost?: number;
  stock: number;
  min_stock?: number;
  image_url?: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: CatalogItem | null;
  mode: 'create' | 'view' | 'edit';
  onSave?: (data: any) => Promise<void>;
}

const categories = [
  'Filtres',
  'Freinage',
  'Distribution',
  'Électrique',
  'Suspension',
  'Huiles & Lubrifiants',
  'Pneumatiques',
  'Accessoires',
  'Autre',
];

export function ProductModal({ isOpen, onClose, product, mode, onSave }: ProductModalProps) {
  const [isEditing, setIsEditing] = useState(mode === 'create' || mode === 'edit');
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    reference: '',
    description: '',
    category: '',
    price: '',
    cost: '',
    stock: '',
    min_stock: '',
    image_url: '',
  });

  useEffect(() => {
    if (product && mode !== 'create') {
      setFormData({
        name: product.name || '',
        reference: product.reference || '',
        description: product.description || '',
        category: product.category || '',
        price: product.price?.toString() || '',
        cost: product.cost?.toString() || '',
        stock: product.stock?.toString() || '',
        min_stock: product.min_stock?.toString() || '',
        image_url: product.image_url || '',
      });
      setImagePreview(product.image_url || null);
    } else {
      setFormData({
        name: '',
        reference: '',
        description: '',
        category: '',
        price: '',
        cost: '',
        stock: '',
        min_stock: '',
        image_url: '',
      });
      setImagePreview(null);
    }
    setIsEditing(mode === 'create' || mode === 'edit');
  }, [product, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSave) return;

    setIsSaving(true);
    try {
      const dataToSave = {
        name: formData.name,
        reference: formData.reference,
        description: formData.description || undefined,
        category: formData.category,
        price: parseFloat(formData.price),
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        stock: parseInt(formData.stock) || 0,
        min_stock: formData.min_stock ? parseInt(formData.min_stock) : undefined,
        image_url: formData.image_url || undefined,
      };

      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Erreur lors de l\'enregistrement du produit');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (mode === 'create') {
      onClose();
    } else {
      setIsEditing(false);
      // Reset form data
      if (product) {
        setFormData({
          name: product.name || '',
          reference: product.reference || '',
          description: product.description || '',
          category: product.category || '',
          price: product.price?.toString() || '',
          cost: product.cost?.toString() || '',
          stock: product.stock?.toString() || '',
          min_stock: product.min_stock?.toString() || '',
          image_url: product.image_url || '',
        });
      }
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, image_url: url });
    setImagePreview(url);
  };

  if (!isOpen) return null;

  const stockLevel = parseInt(formData.stock) || 0;
  const minStock = parseInt(formData.min_stock) || 0;
  const isLowStock = stockLevel > 0 && minStock > 0 && stockLevel <= minStock;
  const isOutOfStock = stockLevel === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-background rounded-lg shadow-2xl border border-border overflow-hidden">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-border">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {mode === 'create' ? 'Nouveau Produit' : isEditing ? 'Modifier le Produit' : formData.name}
                </h2>
                {mode !== 'create' && !isEditing && (
                  <p className="text-sm text-muted-foreground">Référence: {formData.reference}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Stock status banner */}
          {mode !== 'create' && !isEditing && (
            <div className="px-6 pb-3 flex gap-2">
              {isOutOfStock && (
                <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-xs font-medium text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Rupture de stock
                </div>
              )}
              {isLowStock && !isOutOfStock && (
                <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs font-medium text-amber-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Stock faible
                </div>
              )}
              {!isOutOfStock && !isLowStock && (
                <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-xs font-medium text-green-600">
                  En stock
                </div>
              )}
              <div className="px-3 py-1 bg-primary/5 border border-primary/20 rounded-full text-xs font-medium text-primary">
                {formData.category}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Image */}
              <div className="space-y-4">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden border border-border">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt={formData.name || 'Product'}
                      className="w-full h-full object-cover"
                      onError={() => setImagePreview(null)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="space-y-2">
                    <Label htmlFor="image_url" className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      URL de l'image
                    </Label>
                    <Input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Entrez l'URL d'une image ou uploadez-la sur un service d'hébergement
                    </p>
                  </div>
                )}
              </div>

              {/* Right: Form fields */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Informations de base
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        Nom du produit *
                      </Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Ex: Filtre à huile"
                          required
                        />
                      ) : (
                        <p className="text-sm font-medium py-2">{formData.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reference" className="flex items-center gap-2">
                        <Barcode className="h-4 w-4" />
                        Référence *
                      </Label>
                      {isEditing ? (
                        <Input
                          id="reference"
                          value={formData.reference}
                          onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                          placeholder="Ex: FO-001"
                          required
                        />
                      ) : (
                        <p className="text-sm font-mono py-2">{formData.reference}</p>
                      )}
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="category">Catégorie *</Label>
                      {isEditing ? (
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm py-2">{formData.category}</p>
                      )}
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="description">Description</Label>
                      {isEditing ? (
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Description détaillée du produit..."
                          rows={3}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground py-2">{formData.description || 'Aucune description'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Tarification
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Prix de vente (€) *</Label>
                      {isEditing ? (
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="12.50"
                          required
                        />
                      ) : (
                        <p className="text-lg font-bold text-primary py-2">{parseFloat(formData.price).toFixed(2)} €</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cost">Coût d'achat (€)</Label>
                      {isEditing ? (
                        <Input
                          id="cost"
                          type="number"
                          step="0.01"
                          value={formData.cost}
                          onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                          placeholder="8.00"
                        />
                      ) : (
                        <p className="text-sm py-2">{formData.cost ? `${parseFloat(formData.cost).toFixed(2)} €` : '-'}</p>
                      )}
                    </div>

                    {!isEditing && formData.price && formData.cost && (
                      <div className="col-span-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Marge brute</span>
                          <span className="text-sm font-semibold text-primary">
                            {(parseFloat(formData.price) - parseFloat(formData.cost)).toFixed(2)} €
                            ({(((parseFloat(formData.price) - parseFloat(formData.cost)) / parseFloat(formData.price)) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Box className="h-4 w-4" />
                    Stock
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stock">Quantité en stock *</Label>
                      {isEditing ? (
                        <Input
                          id="stock"
                          type="number"
                          value={formData.stock}
                          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                          placeholder="0"
                          required
                        />
                      ) : (
                        <p className={`text-lg font-bold py-2 ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-green-600'}`}>
                          {formData.stock}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="min_stock">Stock minimum</Label>
                      {isEditing ? (
                        <Input
                          id="min_stock"
                          type="number"
                          value={formData.min_stock}
                          onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                          placeholder="5"
                        />
                      ) : (
                        <p className="text-sm py-2">{formData.min_stock || '-'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-muted/30 px-6 py-4 flex items-center justify-end gap-3">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
              <Button onClick={handleEdit} className="bg-primary hover:bg-primary/90">
                Modifier
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
                className="bg-primary hover:bg-primary/90"
              >
                {isSaving ? 'Enregistrement...' : mode === 'create' ? 'Créer le produit' : 'Enregistrer'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
