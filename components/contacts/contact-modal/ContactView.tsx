/**
 * Contact View Component
 * Read-only display of contact information
 */

import { Mail, Phone, MapPin } from 'lucide-react';

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

interface ContactViewProps {
  contact: Contact;
}

export function ContactView({ contact }: ContactViewProps) {
  return (
    <>
      {/* Stats */}
      {contact._count && (
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

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Contact Information */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Informations de contact
          </h3>
          <div className="space-y-3">
            {contact.email && (
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-0.5">Email</div>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-sm text-foreground hover:text-primary transition-colors font-medium"
                  >
                    {contact.email}
                  </a>
                </div>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-0.5">Téléphone</div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="text-sm text-foreground hover:text-primary transition-colors font-medium"
                  >
                    {contact.phone}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Address */}
        {contact.address && (contact.address.street || contact.address.city) && (
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
    </>
  );
}
