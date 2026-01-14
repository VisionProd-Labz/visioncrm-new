'use client';

import { useState, useEffect } from 'react';
import { X, Mail, Phone, Building2, MapPin, Star, User, Save, Loader2 } from 'lucide-react';
import { KryptonCard, KryptonButton } from '@/components/ui/krypton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  is_vip: boolean;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  _count?: {
    vehicles: number;
    quotes: number;
    invoices: number;
  };
}

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact?: Contact | null;
  mode: 'create' | 'view' | 'edit';
  onSave?: (data: any) => Promise<void>;
}

export function ContactModal({ isOpen, onClose, contact, mode, onSave }: ContactModalProps) {
  const [isEditing, setIsEditing] = useState(mode === 'create' || mode === 'edit');
  const [isSaving, setIsSaving] = useState(false);
  const [contactType, setContactType] = useState<'individual' | 'company'>(
    contact?.company ? 'company' : 'individual'
  );

  const [formData, setFormData] = useState({
    first_name: contact?.first_name || '',
    last_name: contact?.last_name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    company: contact?.company || '',
    address: {
      street: contact?.address?.street || '',
      city: contact?.address?.city || '',
      postalCode: contact?.address?.postalCode || '',
      country: contact?.address?.country || 'France',
    },
    is_vip: contact?.is_vip || false,
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        first_name: contact.first_name || '',
        last_name: contact.last_name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        address: {
          street: contact.address?.street || '',
          city: contact.address?.city || '',
          postalCode: contact.address?.postalCode || '',
          country: contact.address?.country || 'France',
        },
        is_vip: contact.is_vip || false,
      });
      setContactType(contact.company ? 'company' : 'individual');
    }
  }, [contact]);

  const handleSave = async () => {
    if (!formData.first_name || !formData.last_name) {
      alert('Le prénom et le nom sont requis');
      return;
    }

    setIsSaving(true);
    try {
      await onSave?.(formData);
      if (mode === 'create') {
        handleClose();
      } else {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving contact:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setIsEditing(mode === 'create' || mode === 'edit');
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company: '',
      address: { street: '', city: '', postalCode: '', country: 'France' },
      is_vip: false,
    });
    setContactType('individual');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-hidden mx-4">
        <KryptonCard className="overflow-hidden border-2 border-border/50 shadow-2xl p-0">
          {/* Header */}
          <div className="relative px-6 py-5 border-b border-border bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {mode === 'create' ? (
                  <h2 className="text-2xl font-bold text-foreground">Nouveau Contact</h2>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30">
                        <span className="text-lg font-bold text-primary">
                          {contact?.first_name?.[0]}{contact?.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">
                          {contact?.first_name} {contact?.last_name}
                        </h2>
                        {contact?.company && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-3.5 h-3.5" />
                            {contact.company}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {mode === 'view' && !isEditing && (
                  <KryptonButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Modifier
                  </KryptonButton>
                )}
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* VIP Badge */}
            {contact?.is_vip && mode !== 'create' && (
              <div className="mt-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-full text-sm font-medium border border-amber-500/20">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  Contact VIP
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Stats (View mode only) */}
            {mode === 'view' && !isEditing && contact?._count && (
              <div className="px-6 py-4 bg-muted/30 border-b border-border">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {contact._count.vehicles}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Véhicules
                    </div>
                  </div>
                  <div className="text-center border-x border-border">
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {contact._count.quotes}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Devis
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground mb-1">
                      {contact._count.invoices}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">
                      Factures
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 space-y-6">
              {isEditing ? (
                /* Edit/Create Mode */
                <>
                  {/* Contact Type Selector (Create mode only) */}
                  {mode === 'create' && (
                    <div>
                      <Label className="text-sm font-semibold text-foreground mb-3 block">
                        Type de contact
                      </Label>
                      <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
                        <button
                          onClick={() => setContactType('individual')}
                          className={cn(
                            'flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all',
                            contactType === 'individual'
                              ? 'bg-background text-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <User className="h-4 w-4 inline-block mr-2" />
                          Particulier
                        </button>
                        <button
                          onClick={() => setContactType('company')}
                          className={cn(
                            'flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all',
                            contactType === 'company'
                              ? 'bg-background text-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <Building2 className="h-4 w-4 inline-block mr-2" />
                          Entreprise
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Company Name */}
                  {contactType === 'company' && (
                    <div>
                      <Label htmlFor="company" className="text-sm font-semibold text-foreground mb-2 block">
                        Nom de l'entreprise *
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          placeholder="ACME Corporation"
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>
                  )}

                  {/* Personal Information */}
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-3 block">
                      Informations personnelles
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first_name" className="text-xs text-muted-foreground mb-1.5 block">
                          Prénom *
                        </Label>
                        <Input
                          id="first_name"
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          placeholder="Jean"
                          className="h-11"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="last_name" className="text-xs text-muted-foreground mb-1.5 block">
                          Nom *
                        </Label>
                        <Input
                          id="last_name"
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          placeholder="Dupont"
                          className="h-11"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-3 block">
                      Coordonnées
                    </Label>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="email" className="text-xs text-muted-foreground mb-1.5 block">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="jean.dupont@example.com"
                            className="pl-10 h-11"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-xs text-muted-foreground mb-1.5 block">
                          Téléphone
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+33 6 12 34 56 78"
                            className="pl-10 h-11"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-3 block flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Adresse
                    </Label>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="street" className="text-xs text-muted-foreground mb-1.5 block">
                          Rue
                        </Label>
                        <Input
                          id="street"
                          value={formData.address.street}
                          onChange={(e) => setFormData({
                            ...formData,
                            address: { ...formData.address, street: e.target.value }
                          })}
                          placeholder="123 Rue de la Paix"
                          className="h-11"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="postalCode" className="text-xs text-muted-foreground mb-1.5 block">
                            Code postal
                          </Label>
                          <Input
                            id="postalCode"
                            value={formData.address.postalCode}
                            onChange={(e) => setFormData({
                              ...formData,
                              address: { ...formData.address, postalCode: e.target.value }
                            })}
                            placeholder="75001"
                            className="h-11"
                          />
                        </div>
                        <div>
                          <Label htmlFor="city" className="text-xs text-muted-foreground mb-1.5 block">
                            Ville
                          </Label>
                          <Input
                            id="city"
                            value={formData.address.city}
                            onChange={(e) => setFormData({
                              ...formData,
                              address: { ...formData.address, city: e.target.value }
                            })}
                            placeholder="Paris"
                            className="h-11"
                          />
                        </div>
                        <div>
                          <Label htmlFor="country" className="text-xs text-muted-foreground mb-1.5 block">
                            Pays
                          </Label>
                          <Input
                            id="country"
                            value={formData.address.country}
                            onChange={(e) => setFormData({
                              ...formData,
                              address: { ...formData.address, country: e.target.value }
                            })}
                            placeholder="France"
                            className="h-11"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* VIP Toggle */}
                  <div className="p-4 border border-border rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                          <Star className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                        </div>
                        <div>
                          <Label htmlFor="is_vip" className="text-base font-semibold text-foreground cursor-pointer">
                            Contact VIP
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Marquer ce contact comme prioritaire
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="is_vip"
                        checked={formData.is_vip}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_vip: checked })}
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* View Mode */
                <div className="space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                      Informations de contact
                    </h3>
                    <div className="space-y-3">
                      {contact?.email && (
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Mail className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground mb-0.5">Email</div>
                            <a href={`mailto:${contact.email}`} className="text-sm text-foreground hover:text-primary transition-colors font-medium">
                              {contact.email}
                            </a>
                          </div>
                        </div>
                      )}
                      {contact?.phone && (
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Phone className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground mb-0.5">Téléphone</div>
                            <a href={`tel:${contact.phone}`} className="text-sm text-foreground hover:text-primary transition-colors font-medium">
                              {contact.phone}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  {contact?.address && (contact.address.street || contact.address.city) && (
                    <div>
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                        Adresse
                      </h3>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4 text-primary" />
                        </div>
                        <div className="text-sm text-foreground">
                          {contact.address.street && <p className="font-medium">{contact.address.street}</p>}
                          {(contact.address.postalCode || contact.address.city) && (
                            <p className="text-muted-foreground mt-1">
                              {contact.address.postalCode} {contact.address.city}
                            </p>
                          )}
                          {contact.address.country && (
                            <p className="text-muted-foreground">{contact.address.country}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border bg-muted/30">
            <div className="flex justify-end gap-3">
              {isEditing ? (
                <>
                  <KryptonButton
                    variant="secondary"
                    onClick={() => {
                      if (mode === 'create') {
                        handleClose();
                      } else {
                        setIsEditing(false);
                        // Reset form data
                        if (contact) {
                          setFormData({
                            first_name: contact.first_name || '',
                            last_name: contact.last_name || '',
                            email: contact.email || '',
                            phone: contact.phone || '',
                            company: contact.company || '',
                            address: {
                              street: contact.address?.street || '',
                              city: contact.address?.city || '',
                              postalCode: contact.address?.postalCode || '',
                              country: contact.address?.country || 'France',
                            },
                            is_vip: contact.is_vip || false,
                          });
                        }
                      }
                    }}
                    disabled={isSaving}
                  >
                    Annuler
                  </KryptonButton>
                  <KryptonButton
                    variant="primary"
                    onClick={handleSave}
                    disabled={isSaving || !formData.first_name || !formData.last_name}
                    icon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    iconPosition="left"
                  >
                    {isSaving ? 'Enregistrement...' : (mode === 'create' ? 'Créer le contact' : 'Enregistrer')}
                  </KryptonButton>
                </>
              ) : (
                <KryptonButton
                  variant="secondary"
                  onClick={handleClose}
                >
                  Fermer
                </KryptonButton>
              )}
            </div>
          </div>
        </KryptonCard>
      </div>
    </div>
  );
}
