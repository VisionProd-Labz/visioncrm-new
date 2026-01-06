'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Receipt, Send, CheckCircle, XCircle, Trash2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SendDialog } from '@/components/send/send-dialog';

interface Invoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: string;
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total: number;
  notes: string | null;
  siret: string | null;
  tva_number: string | null;
  payment_method: string | null;
  paid_at: string | null;
  contact: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    company: string | null;
    address: any;
  };
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    vat_rate: number;
  }>;
  quote: {
    id: string;
    quote_number: string;
  } | null;
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Brouillon',
  SENT: 'Envoyée',
  PAID: 'Payée',
  OVERDUE: 'En retard',
  CANCELLED: 'Annulée',
};

const paymentMethods: Record<string, string> = {
  CASH: 'Espèces',
  CARD: 'Carte bancaire',
  BANK_TRANSFER: 'Virement',
  STRIPE: 'Stripe',
  CHECK: 'Chèque',
};

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [sendDialogOpen, setSendDialogOpen] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${id}`);
      if (response.ok) {
        const data = await response.json();
        setInvoice(data);
        if (data.payment_method) {
          setPaymentMethod(data.payment_method);
        }
      } else if (response.status === 404) {
        router.push('/invoices');
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    if (!invoice) return;

    setIsUpdating(true);
    try {
      const updateData: any = { status };
      if (status === 'PAID' && paymentMethod) {
        updateData.payment_method = paymentMethod;
      }

      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updated = await response.json();
        setInvoice(updated);
      } else {
        alert('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!invoice) return;
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) return;

    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/invoices');
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Erreur lors de la suppression');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Facture non trouvée</p>
      </div>
    );
  }

  const isOverdue = new Date(invoice.due_date) < new Date() && invoice.status === 'SENT';
  const displayStatus = isOverdue ? 'OVERDUE' : invoice.status;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/invoices">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{invoice.invoice_number}</h1>
            <p className="text-muted-foreground">
              Facture pour {invoice.contact.company || `${invoice.contact.first_name} ${invoice.contact.last_name}`}
            </p>
          </div>
        </div>
        <Badge variant={displayStatus === 'PAID' ? 'default' : displayStatus === 'OVERDUE' ? 'destructive' : 'secondary'}>
          {statusLabels[displayStatus]}
        </Badge>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => setSendDialogOpen(true)}
              disabled={isUpdating || !invoice.contact.email && !invoice.contact.phone}
            >
              <Mail className="mr-2 h-4 w-4" />
              Envoyer au client
            </Button>
            {invoice.status === 'DRAFT' && (
              <Button
                size="sm"
                onClick={() => updateStatus('SENT')}
                disabled={isUpdating}
              >
                <Send className="mr-2 h-4 w-4" />
                Marquer comme envoyée
              </Button>
            )}
            {(invoice.status === 'SENT' || isOverdue) && (
              <div className="flex gap-2 items-center flex-wrap">
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Mode de paiement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Espèces</SelectItem>
                    <SelectItem value="CARD">Carte bancaire</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Virement</SelectItem>
                    <SelectItem value="CHECK">Chèque</SelectItem>
                    <SelectItem value="STRIPE">Stripe</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={() => updateStatus('PAID')}
                  disabled={isUpdating || !paymentMethod}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Marquer comme payée
                </Button>
              </div>
            )}
            {invoice.status !== 'CANCELLED' && invoice.status !== 'PAID' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateStatus('CANCELLED')}
                disabled={isUpdating}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Annuler
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              disabled={isUpdating}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Invoice Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Articles et prestations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoice.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-start pb-4 border-b last:border-0">
                    <div className="flex-1">
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × {Number(item.unit_price).toFixed(2)} € HT
                      </p>
                    </div>
                    <p className="font-medium">
                      {(item.quantity * Number(item.unit_price)).toFixed(2)} €
                    </p>
                  </div>
                ))}

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Sous-total HT</span>
                    <span className="font-medium">{Number(invoice.subtotal).toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>TVA ({invoice.vat_rate}%)</span>
                    <span className="font-medium">{Number(invoice.vat_amount).toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total TTC</span>
                    <span>{Number(invoice.total).toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}

          {(invoice.siret || invoice.tva_number) && (
            <Card>
              <CardHeader>
                <CardTitle>Informations légales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {invoice.siret && (
                  <div>
                    <span className="text-muted-foreground">SIRET: </span>
                    <span className="font-medium">{invoice.siret}</span>
                  </div>
                )}
                {invoice.tva_number && (
                  <div>
                    <span className="text-muted-foreground">TVA: </span>
                    <span className="font-medium">{invoice.tva_number}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nom</p>
                <Link
                  href={`/contacts/${invoice.contact.id}`}
                  className="font-medium hover:underline"
                >
                  {invoice.contact.first_name} {invoice.contact.last_name}
                </Link>
              </div>
              {invoice.contact.company && (
                <div>
                  <p className="text-sm text-muted-foreground">Société</p>
                  <p className="font-medium">{invoice.contact.company}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <a
                  href={`mailto:${invoice.contact.email}`}
                  className="text-sm font-medium hover:underline"
                >
                  {invoice.contact.email}
                </a>
              </div>
              {invoice.contact.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <a
                    href={`tel:${invoice.contact.phone}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {invoice.contact.phone}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dates & Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Dates et paiement</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div>
                <p className="text-muted-foreground">Date d'émission</p>
                <p className="font-medium">
                  {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Date d'échéance</p>
                <p className={`font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                  {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                </p>
              </div>
              {invoice.paid_at && (
                <div>
                  <p className="text-muted-foreground">Payée le</p>
                  <p className="font-medium text-green-600">
                    {new Date(invoice.paid_at).toLocaleString('fr-FR')}
                  </p>
                </div>
              )}
              {invoice.payment_method && (
                <div>
                  <p className="text-muted-foreground">Mode de paiement</p>
                  <p className="font-medium">
                    {paymentMethods[invoice.payment_method]}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related Quote */}
          {invoice.quote && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Devis lié</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/quotes/${invoice.quote.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    {invoice.quote.quote_number}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Send Dialog */}
      <SendDialog
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        type="invoice"
        documentNumber={invoice.invoice_number}
        clientName={invoice.contact.company || `${invoice.contact.first_name} ${invoice.contact.last_name}`}
        clientEmail={invoice.contact.email}
        clientPhone={invoice.contact.phone || undefined}
      />
    </div>
  );
}
