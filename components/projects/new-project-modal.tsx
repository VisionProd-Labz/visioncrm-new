'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { KryptonButton } from '@/components/ui/krypton';
import { Plus } from 'lucide-react';

interface NewProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Quote {
  id: string;
  quoteNumber: string;
  totalAmount: number;
}

export function NewProjectModal({ open, onOpenChange, onSuccess }: NewProjectModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contactId: '',
    quoteId: '',
    status: 'PLANNING' as const,
  });

  useEffect(() => {
    if (open) {
      fetchContacts();
      fetchQuotes();
    }
  }, [open]);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts');
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchQuotes = async () => {
    try {
      const response = await fetch('/api/quotes');
      if (response.ok) {
        const data = await response.json();
        setQuotes(data.quotes || []);
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Le nom du projet est requis');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          contactId: formData.contactId || null,
          quoteId: formData.quoteId || null,
          status: formData.status,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du projet');
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        contactId: '',
        quoteId: '',
        status: 'PLANNING',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Une erreur est survenue lors de la création du projet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Nouveau projet
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nom du projet <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Mon super projet"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description du projet..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactId">Client associé</Label>
              <select
                id="contactId"
                value={formData.contactId}
                onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Aucun client</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.firstName} {contact.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quoteId">Devis associé</Label>
              <select
                id="quoteId"
                value={formData.quoteId}
                onChange={(e) => setFormData({ ...formData, quoteId: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Aucun devis</option>
                {quotes.map((quote) => (
                  <option key={quote.id} value={quote.id}>
                    {quote.quoteNumber} - {quote.totalAmount.toLocaleString('fr-FR')}€
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Statut initial</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as any })
              }
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="PLANNING">Planification</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="ON_HOLD">En pause</option>
              <option value="COMPLETED">Terminé</option>
              <option value="CANCELLED">Annulé</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>

            <KryptonButton
              type="submit"
              variant="primary"
              size="md"
              disabled={isLoading}
              icon={<Plus className="w-4 h-4" />}
              iconPosition="left"
            >
              {isLoading ? 'Création...' : 'Créer le projet'}
            </KryptonButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
