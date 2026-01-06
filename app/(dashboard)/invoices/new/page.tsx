'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  company: string | null;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
}

function NewInvoiceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quoteId = searchParams.get('quote_id');

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [contactId, setContactId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [siret, setSiret] = useState('');
  const [tvaNumber, setTvaNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unit_price: 0, vat_rate: 20 },
  ]);

  useEffect(() => {
    fetchContacts();

    // Set default due date (30 days from now)
    const date = new Date();
    date.setDate(date.getDate() + 30);
    setDueDate(date.toISOString().split('T')[0]);
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts');
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0, vat_rate: 20 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateVAT = () => {
    const subtotal = calculateSubtotal();
    const vatRate = items[0]?.vat_rate || 20;
    return (subtotal * vatRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVAT();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_id: contactId,
          quote_id: quoteId || undefined,
          due_date: dueDate,
          items,
          siret: siret || undefined,
          tva_number: tvaNumber || undefined,
          notes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la création');
      }

      const invoice = await response.json();
      router.push(`/invoices/${invoice.id}`);
    } catch (error: any) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/invoices">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nouvelle facture</h1>
          <p className="text-muted-foreground">
            Créez une nouvelle facture pour un client
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Client Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informations client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact_id">Client *</Label>
              <select
                id="contact_id"
                required
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                disabled={isLoading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Sélectionnez un client</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.company || `${contact.first_name} ${contact.last_name}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="due_date">Date d'échéance *</Label>
                <Input
                  id="due_date"
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="siret">SIRET (optionnel)</Label>
                <Input
                  id="siret"
                  maxLength={14}
                  value={siret}
                  onChange={(e) => setSiret(e.target.value)}
                  placeholder="12345678901234"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tva_number">Numéro de TVA (optionnel)</Label>
                <Input
                  id="tva_number"
                  value={tvaNumber}
                  onChange={(e) => setTvaNumber(e.target.value)}
                  placeholder="FR12345678901"
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Articles et prestations</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex gap-4 items-end p-4 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <Label>Description</Label>
                  <Input
                    required
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Ex: Vidange + filtre à huile"
                    disabled={isLoading}
                  />
                </div>
                <div className="w-24 space-y-2">
                  <Label>Quantité</Label>
                  <Input
                    type="number"
                    required
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                    disabled={isLoading}
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label>Prix unitaire HT</Label>
                  <Input
                    type="number"
                    required
                    min={0}
                    step={0.01}
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value))}
                    disabled={isLoading}
                  />
                </div>
                <div className="w-24 space-y-2">
                  <Label>TVA %</Label>
                  <Input
                    type="number"
                    required
                    min={0}
                    max={100}
                    step={0.1}
                    value={item.vat_rate}
                    onChange={(e) => updateItem(index, 'vat_rate', parseFloat(e.target.value))}
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1 || isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sous-total HT</span>
                <span className="font-medium">{calculateSubtotal().toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>TVA ({items[0]?.vat_rate || 20}%)</span>
                <span className="font-medium">{calculateVAT().toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total TTC</span>
                <span>{calculateTotal().toFixed(2)} €</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notes (optionnel)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Conditions de paiement, modalités..."
              rows={4}
              disabled={isLoading}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Création...' : 'Créer la facture'}
          </Button>
          <Link href="/invoices">
            <Button type="button" variant="outline" disabled={isLoading}>
              Annuler
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewInvoiceForm />
    </Suspense>
  );
}
