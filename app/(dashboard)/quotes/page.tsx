'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, FileText, Filter, MoreVertical, Search, Upload, Download, Edit, Trash2, Eye, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PdfImportDialog } from '@/components/import/pdf-import-dialog';
import { AdvancedExportDialog } from '@/components/export/advanced-export-dialog';
import { PDFPreviewModal } from '@/components/preview/pdf-preview-modal';

interface Quote {
  id: string;
  quote_number: string;
  issue_date: string;
  valid_until: string;
  status: string;
  total: number;
  contact: {
    id: string;
    first_name: string;
    last_name: string;
    company: string | null;
  };
}

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  DRAFT: 'outline',
  SENT: 'secondary',
  ACCEPTED: 'default',
  REJECTED: 'destructive',
  EXPIRED: 'outline',
};

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  company: string | null;
}

interface QuoteItem {
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
}

export default function QuotesPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 20,
    hasMore: false,
    total: 0,
  });
  const [pdfImportOpen, setPdfImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [previewQuote, setPreviewQuote] = useState<any | null>(null);
  const [quoteForm, setQuoteForm] = useState({
    contact_id: '',
    valid_until: '',
    items: [{ description: '', quantity: 1, unit_price: 0, vat_rate: 20 }] as QuoteItem[],
    notes: '',
  });

  const statusLabels: Record<string, string> = {
    DRAFT: t('quotes.status.draft'),
    SENT: t('quotes.status.sent'),
    ACCEPTED: t('quotes.status.accepted'),
    REJECTED: t('quotes.status.rejected'),
    EXPIRED: t('quotes.status.expired'),
  };

  useEffect(() => {
    fetchQuotes(true);
  }, [statusFilter]);

  useEffect(() => {
    if (showCreateModal) {
      fetchContacts();
    }
  }, [showCreateModal]);

  const fetchQuotes = async (reset = false) => {
    try {
      const currentOffset = reset ? 0 : pagination.offset;
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: currentOffset.toString(),
      });

      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const url = `/api/quotes?${params.toString()}`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();

        if (reset) {
          setQuotes(data.quotes);
        } else {
          setQuotes(prev => [...prev, ...data.quotes]);
        }

        setPagination({
          offset: currentOffset + data.quotes.length,
          limit: pagination.limit,
          hasMore: data.pagination?.hasMore || false,
          total: data.pagination?.total || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMoreQuotes = async () => {
    setIsLoadingMore(true);
    await fetchQuotes(false);
  };

  const handleDelete = async (id: string, quoteNumber: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${quoteNumber} ?`)) return;
    try {
      const response = await fetch(`/api/quotes/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchQuotes();
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts?limit=100');
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const resetQuoteForm = () => {
    setQuoteForm({
      contact_id: '',
      valid_until: '',
      items: [{ description: '', quantity: 1, unit_price: 0, vat_rate: 20 }],
      notes: '',
    });
  };

  const addItem = () => {
    setQuoteForm({
      ...quoteForm,
      items: [...quoteForm.items, { description: '', quantity: 1, unit_price: 0, vat_rate: 20 }],
    });
  };

  const removeItem = (index: number) => {
    if (quoteForm.items.length > 1) {
      setQuoteForm({
        ...quoteForm,
        items: quoteForm.items.filter((_, i) => i !== index),
      });
    }
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const newItems = [...quoteForm.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setQuoteForm({ ...quoteForm, items: newItems });
  };

  const calculateTotal = () => {
    return quoteForm.items.reduce((total, item) => {
      const itemTotal = item.quantity * item.unit_price;
      const itemWithVat = itemTotal * (1 + item.vat_rate / 100);
      return total + itemWithVat;
    }, 0);
  };

  const handleCreateQuote = async () => {
    if (!quoteForm.contact_id || !quoteForm.valid_until) {
      alert('Le contact et la date de validité sont requis');
      return;
    }

    if (quoteForm.items.some(item => !item.description)) {
      alert('Toutes les lignes doivent avoir une description');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteForm),
      });

      if (response.ok) {
        await fetchQuotes();
        setShowCreateModal(false);
        resetQuoteForm();
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la création du devis');
      }
    } catch (error) {
      console.error('Error creating quote:', error);
      alert('Erreur lors de la création du devis');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = async (quoteId: string) => {
    try {
      const response = await fetch(`/api/quotes/${quoteId}`);
      if (response.ok) {
        const data = await response.json();
        setPreviewQuote(data.quote);
        setShowPreviewModal(true);
      } else {
        alert('Erreur lors du chargement du devis');
      }
    } catch (error) {
      console.error('Error fetching quote for preview:', error);
      alert('Erreur lors du chargement du devis');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-t-primary border-r-primary border-b-border border-l-border rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">{t('quotes.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('quotes.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('quotes.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPdfImportOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            {t('quotes.import_pdf')}
          </Button>
          <Button variant="outline" onClick={() => setExportOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            {t('quotes.export')}
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('quotes.new_quote')}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('quotes.search_placeholder')}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t('quotes.all_status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('quotes.all_status')}</SelectItem>
                <SelectItem value="DRAFT">{t('quotes.status.draft')}</SelectItem>
                <SelectItem value="SENT">{t('quotes.status.sent')}</SelectItem>
                <SelectItem value="ACCEPTED">{t('quotes.status.accepted')}</SelectItem>
                <SelectItem value="REJECTED">{t('quotes.status.rejected')}</SelectItem>
                <SelectItem value="EXPIRED">{t('quotes.status.expired')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Quotes Table */}
      {quotes.length > 0 ? (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('quotes.table.number')}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('quotes.table.client')}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('quotes.table.issue_date')}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('quotes.table.valid_until')}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('quotes.table.amount')}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('quotes.table.status')}</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">{t('quotes.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => {
                  const isExpired = new Date(quote.valid_until) < new Date();
                  const displayStatus = isExpired && quote.status === 'SENT' ? 'EXPIRED' : quote.status;

                  return (
                    <tr
                      key={quote.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-4">
                        <Link
                          href={`/quotes/${quote.id}`}
                          className="font-mono text-sm text-primary hover:underline"
                        >
                          {quote.quote_number}
                        </Link>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500 text-xs font-semibold">
                            {quote.contact.first_name[0]}{quote.contact.last_name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {quote.contact.company || `${quote.contact.first_name} ${quote.contact.last_name}`}
                            </p>
                            {quote.contact.company && (
                              <p className="text-xs text-muted-foreground">
                                {quote.contact.first_name} {quote.contact.last_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-foreground">
                        {new Date(quote.issue_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="p-4 text-sm text-foreground">
                        <span className={isExpired ? 'text-destructive' : ''}>
                          {new Date(quote.valid_until).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-semibold text-foreground">
                        €{Number(quote.total).toFixed(2)}
                      </td>
                      <td className="p-4">
                        <Badge variant={statusVariants[displayStatus]}>
                          {statusLabels[displayStatus]}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/quotes/${quote.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePreview(quote.id)}>
                              <FileText className="h-4 w-4 mr-2" />
                              Aperçu PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/quotes/${quote.id}/edit`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(quote.id, quote.quote_number)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Load More Button */}
          {pagination.hasMore && (
            <div className="p-4 border-t border-border bg-muted/30">
              <Button
                variant="outline"
                onClick={loadMoreQuotes}
                disabled={isLoadingMore}
                className="w-full"
              >
                {isLoadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-t-primary border-r-primary border-b-border border-l-border rounded-full animate-spin mr-2" />
                    Chargement...
                  </>
                ) : (
                  `Charger plus (${pagination.total - quotes.length} restants)`
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('quotes.empty_title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('quotes.empty_description')}
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('quotes.create_button')}
            </Button>
          </div>
        </div>
      )}

      {/* Create Quote Modal */}
      <Dialog open={showCreateModal} onOpenChange={(open) => {
        setShowCreateModal(open);
        if (!open) resetQuoteForm();
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('quotes.new_quote')}</DialogTitle>
            <DialogDescription>
              Créez un nouveau devis rapidement
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Contact and Valid Until */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact">Client *</Label>
                <Select
                  value={quoteForm.contact_id}
                  onValueChange={(value) => setQuoteForm({ ...quoteForm, contact_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.company || `${contact.first_name} ${contact.last_name}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valid_until">Valide jusqu'au *</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={quoteForm.valid_until}
                  onChange={(e) => setQuoteForm({ ...quoteForm, valid_until: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Articles</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter une ligne
                </Button>
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/50 p-3 grid grid-cols-12 gap-2 text-sm font-medium">
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2">Quantité</div>
                  <div className="col-span-2">Prix unitaire</div>
                  <div className="col-span-2">TVA %</div>
                  <div className="col-span-1"></div>
                </div>

                {quoteForm.items.map((item, index) => (
                  <div key={index} className="p-3 grid grid-cols-12 gap-2 border-t border-border">
                    <div className="col-span-5">
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Description de l'article"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={item.vat_rate}
                        onChange={(e) => updateItem(index, 'vat_rate', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      {quoteForm.items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-end pt-2">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total TTC</p>
                  <p className="text-2xl font-bold text-foreground">
                    €{calculateTotal().toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Input
                id="notes"
                value={quoteForm.notes}
                onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                placeholder="Notes supplémentaires..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                resetQuoteForm();
              }}
              disabled={isSaving}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateQuote}
              disabled={isSaving || !quoteForm.contact_id || !quoteForm.valid_until}
            >
              {isSaving ? 'Création...' : 'Créer le devis'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogs */}
      <PdfImportDialog
        open={pdfImportOpen}
        onOpenChange={setPdfImportOpen}
        type="quotes"
      />
      <AdvancedExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        type="quotes"
      />
      {previewQuote && (
        <PDFPreviewModal
          open={showPreviewModal}
          onOpenChange={setShowPreviewModal}
          type="quote"
          data={{
            id: previewQuote.id,
            reference: previewQuote.quote_number,
            created_at: previewQuote.issue_date,
            valid_until: previewQuote.valid_until,
            status: previewQuote.status,
            contact: previewQuote.contact,
            items: previewQuote.items || [],
          }}
        />
      )}
    </div>
  );
}
