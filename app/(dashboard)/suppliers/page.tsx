'use client';

import { useEffect, useState } from 'react';
import { Plus, Building2, Phone, Mail, MapPin, Globe, Star, MoreVertical, Edit, Trash2, Search, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/language-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface Supplier {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: any;
  category: string | null;
  is_preferred: boolean;
  notes: string | null;
  created_at: string;
}

export default function SuppliersPage() {
  const { t } = useLanguage();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    category: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'France',
    },
    is_preferred: false,
    notes: '',
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data.suppliers);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSupplierForm({
      name: '',
      email: '',
      phone: '',
      website: '',
      category: '',
      address: {
        street: '',
        city: '',
        postalCode: '',
        country: 'France',
      },
      is_preferred: false,
      notes: '',
    });
  };

  const handleCreateSupplier = async () => {
    if (!supplierForm.name) {
      alert('Le nom du fournisseur est requis');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierForm),
      });

      if (response.ok) {
        await fetchSuppliers();
        setShowCreateModal(false);
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la création du fournisseur');
      }
    } catch (error) {
      console.error('Error creating supplier:', error);
      alert('Erreur lors de la création du fournisseur');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${name} ?`)) return;

    try {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSuppliers();
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryColors: Record<string, string> = {
    'Pièces auto': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    'Outillage': 'bg-green-500/10 text-green-600 border-green-500/20',
    'Consommables': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    'Equipement': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    'Services': 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-t-primary border-r-primary border-b-border border-l-border rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fournisseurs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez vos fournisseurs et partenaires
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouveau fournisseur
        </Button>
      </div>

      {/* Search */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un fournisseur..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Suppliers Grid */}
      {filteredSuppliers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow relative group"
            >
              {/* Preferred Badge */}
              {supplier.is_preferred && (
                <div className="absolute top-4 right-4">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                </div>
              )}

              {/* Dropdown Menu */}
              <div className="absolute top-4 right-12 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(supplier.id, supplier.name)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Company Icon */}
              <div className="mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              </div>

              {/* Company Name */}
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {supplier.name}
              </h3>

              {/* Category */}
              {supplier.category && (
                <div className="mb-4">
                  <Badge
                    variant="outline"
                    className={categoryColors[supplier.category] || 'bg-gray-500/10 text-gray-600 border-gray-500/20'}
                  >
                    <Package className="h-3 w-3 mr-1" />
                    {supplier.category}
                  </Badge>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                {supplier.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <a href={`mailto:${supplier.email}`} className="hover:text-primary transition-colors truncate">
                      {supplier.email}
                    </a>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${supplier.phone}`} className="hover:text-primary transition-colors">
                      {supplier.phone}
                    </a>
                  </div>
                )}
                {supplier.website && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <a
                      href={supplier.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors truncate"
                    >
                      {supplier.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {supplier.address && (supplier.address.city || supplier.address.street) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">
                      {supplier.address.city}
                      {supplier.address.postalCode && `, ${supplier.address.postalCode}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Notes Preview */}
              {supplier.notes && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-2 pt-2 border-t border-border">
                  {supplier.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Aucun fournisseur
              </h3>
              <p className="text-sm text-muted-foreground">
                Commencez par ajouter votre premier fournisseur
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouveau fournisseur
            </Button>
          </div>
        </div>
      )}

      {/* Create Supplier Modal */}
      <Dialog open={showCreateModal} onOpenChange={(open) => {
        setShowCreateModal(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau fournisseur</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau fournisseur à votre base de données
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'entreprise *</Label>
              <Input
                id="name"
                value={supplierForm.name}
                onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                placeholder="ACME Auto Parts"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <select
                id="category"
                value={supplierForm.category}
                onChange={(e) => setSupplierForm({ ...supplierForm, category: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background"
              >
                <option value="">-- Sélectionner --</option>
                <option value="Pièces auto">Pièces auto</option>
                <option value="Outillage">Outillage</option>
                <option value="Consommables">Consommables</option>
                <option value="Equipement">Equipement</option>
                <option value="Services">Services</option>
              </select>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={supplierForm.email}
                  onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
                  placeholder="contact@acme.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={supplierForm.phone}
                  onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                  placeholder="+33 1 23 45 67 89"
                />
              </div>
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website">Site web</Label>
              <Input
                id="website"
                type="url"
                value={supplierForm.website}
                onChange={(e) => setSupplierForm({ ...supplierForm, website: e.target.value })}
                placeholder="https://www.acme.com"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="street">Adresse</Label>
              <Input
                id="street"
                value={supplierForm.address.street}
                onChange={(e) => setSupplierForm({
                  ...supplierForm,
                  address: { ...supplierForm.address, street: e.target.value }
                })}
                placeholder="123 Rue du Commerce"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Code postal</Label>
                <Input
                  id="postalCode"
                  value={supplierForm.address.postalCode}
                  onChange={(e) => setSupplierForm({
                    ...supplierForm,
                    address: { ...supplierForm.address, postalCode: e.target.value }
                  })}
                  placeholder="75001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={supplierForm.address.city}
                  onChange={(e) => setSupplierForm({
                    ...supplierForm,
                    address: { ...supplierForm.address, city: e.target.value }
                  })}
                  placeholder="Paris"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Input
                  id="country"
                  value={supplierForm.address.country}
                  onChange={(e) => setSupplierForm({
                    ...supplierForm,
                    address: { ...supplierForm.address, country: e.target.value }
                  })}
                  placeholder="France"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={supplierForm.notes}
                onChange={(e) => setSupplierForm({ ...supplierForm, notes: e.target.value })}
                placeholder="Informations complémentaires..."
                rows={3}
              />
            </div>

            {/* Preferred toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_preferred"
                checked={supplierForm.is_preferred}
                onChange={(e) => setSupplierForm({ ...supplierForm, is_preferred: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="is_preferred" className="cursor-pointer">
                Marquer comme fournisseur préféré
              </Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              disabled={isSaving}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateSupplier}
              disabled={isSaving || !supplierForm.name}
            >
              {isSaving ? 'Création...' : 'Créer le fournisseur'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
