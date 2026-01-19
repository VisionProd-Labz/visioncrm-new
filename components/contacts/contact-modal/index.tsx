/**
 * Contact Modal - Main Shell
 * Orchestrates ContactForm, ContactView, and ContactModalHeader
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { KryptonCard, KryptonButton } from '@/components/ui/krypton';
import { ContactModalHeader } from './ContactModalHeader';
import { ContactView } from './ContactView';
import { ContactForm } from './ContactForm';
import { ContactFormData, defaultContactValues } from './contact-schema';

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
  onSave?: (data: ContactFormData) => Promise<void>;
}

export function ContactModal({ isOpen, onClose, contact, mode, onSave }: ContactModalProps) {
  const [isEditing, setIsEditing] = useState(mode === 'create' || mode === 'edit');
  const [isSaving, setIsSaving] = useState(false);
  const [formSubmitTrigger, setFormSubmitTrigger] = useState(0);

  useEffect(() => {
    setIsEditing(mode === 'create' || mode === 'edit');
  }, [mode]);

  const getDefaultValues = (): ContactFormData => {
    if (!contact) return defaultContactValues;

    return {
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
    };
  };

  const handleSave = async (data: ContactFormData) => {
    setIsSaving(true);
    try {
      await onSave?.(data);
      if (mode === 'create') {
        handleClose();
      } else {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving contact:', error);
      // Error is handled by onSave (should show toast/notification)
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setIsEditing(mode === 'create' || mode === 'edit');
    onClose();
  };

  const handleFormSubmit = () => {
    // Trigger form submission by updating state
    setFormSubmitTrigger(prev => prev + 1);
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
          <ContactModalHeader
            mode={mode}
            contact={contact}
            isEditing={isEditing}
            onEdit={() => setIsEditing(true)}
            onClose={handleClose}
          />

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
            {isEditing ? (
              <ContactForm
                defaultValues={getDefaultValues()}
                mode={mode === 'create' ? 'create' : 'edit'}
                onSubmit={handleSave}
                submitTrigger={formSubmitTrigger}
              />
            ) : (
              contact && <ContactView contact={contact} />
            )}
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
                      }
                    }}
                    disabled={isSaving}
                  >
                    Annuler
                  </KryptonButton>
                  <KryptonButton
                    variant="primary"
                    onClick={handleFormSubmit}
                    disabled={isSaving}
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
