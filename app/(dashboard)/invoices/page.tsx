'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Receipt, Filter, MoreVertical, Search, Upload, Download, Edit, Trash2, Eye, X } from 'lucide-react';
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

interface Invoice {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: string;
  total: number;
  contact: {
    id: string;
    first_name: string;
    last_name: string;
    company: string | null;
  };
  quote: {
    id: string;
    quote_number: string;
  } | null;
}

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  DRAFT: 'outline',
  SENT: 'secondary',
  PAID: 'default',
  OVERDUE: 'destructive',
  CANCELLED: 'outline',
};

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

export default function InvoicesPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pdfImportOpen, setPdfImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [previewInvoice, setPreviewInvoice] = useState<any | null>(null);
  const [invoiceForm, setInvoiceForm] = useState({
    contact_id: '',
    due_date: '',
    items: [{ description: '', quantity: 1, unit_price: 0, vat_rate: 20 }] as InvoiceItem[],
    notes: '',
  });

  const statusLabels: Record<string, string> = {
    DRAFT: t('invoices.status.draft'),
    SENT: t('invoices.status.sent'),
    PAID: t('invoices.status.paid'),
    OVERDUE: t('invoices.status.overdue'),
    CANCELLED: t('invoices.status.cancelled'),
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  useEffect(() => {
    if (showCreateModal) {
      fetchContacts();
    }
  }, [showCreateModal]);

  const fetchInvoices = async () => {
    try {
      const url = `/api/invoices${statusFilter ? `?status=${statusFilter}` : ''}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, invoiceNumber: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${invoiceNumber} ?`)) return;
    try {
      const response = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchInvoices();
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

  const resetInvoiceForm = () => {
    setInvoiceForm({
      contact_id: '',
      due_date: '',
      items: [{ description: '', quantity: 1, unit_price: 0, vat_rate: 20 }],
      notes: '',
    });
  };

  const addItem = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, { description: '', quantity: 1, unit_price: 0, vat_rate: 20 }],
    });
  };

  const removeItem = (index: number) => {
    if (invoiceForm.items.length > 1) {
      setInvoiceForm({
        ...invoiceForm,
        items: invoiceForm.items.filter((_, i) => i !== index),
      });
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...invoiceForm.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setInvoiceForm({ ...invoiceForm, items: newItems });
  };

  const calculateTotal = () => {
    return invoiceForm.items.reduce((total, item) => {
      const itemTotal = item.quantity * item.unit_price;
      const itemWithVat = itemTotal * (1 + item.vat_rate / 100);
      return total + itemWithVat;
    }, 0);
  };

  const handleCreateInvoice = async () => {
    if (!invoiceForm.contact_id || !invoiceForm.due_date) {
      alert('Le contact et la date d\'échéance sont requis');
      return;
    }

    if (invoiceForm.items.some(item => !item.description)) {
      alert('Toutes les lignes doivent avoir une description');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceForm),
      });

      if (response.ok) {
        await fetchInvoices();
        setShowCreateModal(false);
        resetInvoiceForm();
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de la création de la facture');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Erreur lors de la création de la facture');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`);
      if (response.ok) {
        const data = await response.json();
        setPreviewInvoice(data.invoice);
        setShowPreviewModal(true);
      } else {
        alert('Erreur lors du chargement de la facture');
      }
    } catch (error) {
      console.error('Error fetching invoice for preview:', error);
      alert('Erreur lors du chargement de la facture');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-t-primary border-r-primary border-b-border border-l-border rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">{t('invoices.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('invoices.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('invoices.subtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPdfImportOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            {t('invoices.import_pdf')}
          </Button>
          <Button variant="outline" onClick={() => setExportOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            {t('invoices.export')}
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('invoices.new_invoice')}
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
              placeholder={t('invoices.search_placeholder')}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t('invoices.all_status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('invoices.all_status')}</SelectItem>
                <SelectItem value="DRAFT">{t('invoices.status.draft')}</SelectItem>
                <SelectItem value="SENT">{t('invoices.status.sent')}</SelectItem>
                <SelectItem value="PAID">{t('invoices.status.paid')}</SelectItem>
                <SelectItem value="OVERDUE">{t('invoices.status.overdue')}</SelectItem>
                <SelectItem value="CANCELLED">{t('invoices.status.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      {invoices.length > 0 ? (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('invoices.table.number')}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('invoices.table.client')}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('invoices.table.issue_date')}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('invoices.table.due_date')}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('invoices.table.amount')}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('invoices.table.status')}</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">{t('invoices.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const isOverdue = new Date(invoice.due_date) < new Date() && invoice.status === 'SENT';
                  const displayStatus = isOverdue ? 'OVERDUE' : invoice.status;

                  return (
                    <tr
                      key={invoice.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-4">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="font-mono text-sm text-primary hover:underline"
                        >
                          {invoice.invoice_number}
                        </Link>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500 text-xs font-semibold">
                            {invoice.contact.first_name[0]}{invoice.contact.last_name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {invoice.contact.company || `${invoice.contact.first_name} ${invoice.contact.last_name}`}
                            </p>
                            {invoice.quote && (
                              <p className="text-xs text-muted-foreground">
                                {t('invoices.quote_reference')} : {invoice.quote.quote_number}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-foreground">
                        {new Date(invoice.issue_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="p-4 text-sm">
                        <span className={isOverdue ? 'text-destructive font-medium' : 'text-foreground'}>
                          {new Date(invoice.due_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-semibold text-foreground">
                        €{Number(invoice.total).toFixed(2)}
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
                            <DropdownMenuItem onClick={() => router.push(`/invoices/${invoice.id}`)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePreview(invoice.id)}>
                              <Receipt className="h-4 w-4 mr-2" />
                              Aperçu PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/invoices/${invoice.id}/edit`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(invoice.id, invoice.invoice_number)}
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
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Receipt className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('invoices.empty_title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('invoices.empty_description')}
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t('invoices.create_button')}
            </Button>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      <Dialog open={showCreateModal} onOpenChange={(open) => {
        setShowCreateModal(open);
        if (!open) resetInvoiceForm();
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('invoices.new_invoice')}</DialogTitle>
            <DialogDescription>
              Créez une nouvelle facture rapidement
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Contact and Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact">Client *</Label>
                <Select
                  value={invoiceForm.contact_id}
                  onValueChange={(value) => setInvoiceForm({ ...invoiceForm, contact_id: value })}
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
                <Label htmlFor="due_date">Date d'échéance *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={invoiceForm.due_date}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
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

                {invoiceForm.items.map((item, index) => (
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
                      {invoiceForm.items.length > 1 && (
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
                value={invoiceForm.notes}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
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
                resetInvoiceForm();
              }}
              disabled={isSaving}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateInvoice}
              disabled={isSaving || !invoiceForm.contact_id || !invoiceForm.due_date}
            >
              {isSaving ? 'Création...' : 'Créer la facture'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogs */}
      <PdfImportDialog
        open={pdfImportOpen}
        onOpenChange={setPdfImportOpen}
        type="invoices"
      />
      <AdvancedExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        type="invoices"
      />
      {previewInvoice && (
        <PDFPreviewModal
          open={showPreviewModal}
          onOpenChange={setShowPreviewModal}
          type="invoice"
          data={{
            id: previewInvoice.id,
            reference: previewInvoice.invoice_number,
            created_at: previewInvoice.issue_date,
            due_date: previewInvoice.due_date,
            status: previewInvoice.status,
            contact: previewInvoice.contact,
            items: previewInvoice.items || [],
          }}
        />
      )}
    </div>
  );
}
