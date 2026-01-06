'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Send, Check, X, FileCheck, Trash2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SendDialog } from '@/components/send/send-dialog';

interface Quote {
  id: string;
  quote_number: string;
  issue_date: string;
  valid_until: string;
  status: string;
  subtotal: number;
  vat_rate: number;
  vat_amount: number;
  total: number;
  notes: string | null;
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
  invoice: {
    id: string;
    invoice_number: string;
  } | null;
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Brouillon',
  SENT: 'Envoyé',
  ACCEPTED: 'Accepté',
  REJECTED: 'Refusé',
  EXPIRED: 'Expiré',
};

export default function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);

  useEffect(() => {
    fetchQuote();
  }, [id]);

  const fetchQuote = async () => {
    try {
      const response = await fetch(`/api/quotes/${id}`);
      if (response.ok) {
        const data = await response.json();
        setQuote(data);
      } else if (response.status === 404) {
        router.push('/quotes');
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    if (!quote) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/quotes/${quote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const updated = await response.json();
        setQuote(updated);
      } else {
        alert('Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating quote:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setIsUpdating(false);
    }
  };

  const convertToInvoice = async () => {
    if (!quote) return;

    if (quote.status !== 'ACCEPTED') {
      alert('Le devis doit être accepté avant conversion en facture');
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/quotes/${quote.id}/convert`, {
        method: 'POST',
      });

      if (response.ok) {
        const invoice = await response.json();
        router.push(`/invoices/${invoice.id}`);
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la conversion');
      }
    } catch (error) {
      console.error('Error converting quote:', error);
      alert('Erreur lors de la conversion');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!quote) return;
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) return;

    try {
      const response = await fetch(`/api/quotes/${quote.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/quotes');
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting quote:', error);
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

  if (!quote) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Devis non trouvé</p>
      </div>
    );
  }

  const isExpired = new Date(quote.valid_until) < new Date();
  const displayStatus = isExpired && quote.status === 'SENT' ? 'EXPIRED' : quote.status;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/quotes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{quote.quote_number}</h1>
            <p className="text-muted-foreground">
              Devis pour {quote.contact.company || `${quote.contact.first_name} ${quote.contact.last_name}`}
            </p>
          </div>
        </div>
        <Badge variant={displayStatus === 'ACCEPTED' ? 'default' : 'secondary'}>
          {statusLabels[displayStatus]}
        </Badge>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={() => setSendDialogOpen(true)}
            disabled={isUpdating || !quote.contact.email && !quote.contact.phone}
          >
            <Mail className="mr-2 h-4 w-4" />
            Envoyer au client
          </Button>
          {quote.status === 'DRAFT' && (
            <Button
              size="sm"
              onClick={() => updateStatus('SENT')}
              disabled={isUpdating}
            >
              <Send className="mr-2 h-4 w-4" />
              Marquer comme envoyé
            </Button>
          )}
          {quote.status === 'SENT' && !isExpired && (
            <>
              <Button
                size="sm"
                onClick={() => updateStatus('ACCEPTED')}
                disabled={isUpdating}
              >
                <Check className="mr-2 h-4 w-4" />
                Accepter
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => updateStatus('REJECTED')}
                disabled={isUpdating}
              >
                <X className="mr-2 h-4 w-4" />
                Refuser
              </Button>
            </>
          )}
          {quote.status === 'ACCEPTED' && !quote.invoice && (
            <Button
              size="sm"
              onClick={convertToInvoice}
              disabled={isUpdating}
            >
              <FileCheck className="mr-2 h-4 w-4" />
              Convertir en facture
            </Button>
          )}
          {quote.invoice && (
            <Link href={`/invoices/${quote.invoice.id}`}>
              <Button size="sm" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Voir la facture {quote.invoice.invoice_number}
              </Button>
            </Link>
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
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Quote Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Articles et prestations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quote.items.map((item: any, index: number) => (
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
                    <span className="font-medium">{Number(quote.subtotal).toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>TVA ({quote.vat_rate}%)</span>
                    <span className="font-medium">{Number(quote.vat_amount).toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total TTC</span>
                    <span>{Number(quote.total).toFixed(2)} €</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {quote.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{quote.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Client Info */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Nom</p>
                <Link
                  href={`/contacts/${quote.contact.id}`}
                  className="font-medium hover:underline"
                >
                  {quote.contact.first_name} {quote.contact.last_name}
                </Link>
              </div>
              {quote.contact.company && (
                <div>
                  <p className="text-sm text-muted-foreground">Société</p>
                  <p className="font-medium">{quote.contact.company}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <a
                  href={`mailto:${quote.contact.email}`}
                  className="text-sm font-medium hover:underline"
                >
                  {quote.contact.email}
                </a>
              </div>
              {quote.contact.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <a
                    href={`tel:${quote.contact.phone}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {quote.contact.phone}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Dates</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div>
                <p className="text-muted-foreground">Date d'émission</p>
                <p className="font-medium">
                  {new Date(quote.issue_date).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Valable jusqu'au</p>
                <p className="font-medium">
                  {new Date(quote.valid_until).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Send Dialog */}
      <SendDialog
        open={sendDialogOpen}
        onOpenChange={setSendDialogOpen}
        type="quote"
        documentNumber={quote.quote_number}
        clientName={quote.contact.company || `${quote.contact.first_name} ${quote.contact.last_name}`}
        clientEmail={quote.contact.email}
        clientPhone={quote.contact.phone || undefined}
      />
    </div>
  );
}
