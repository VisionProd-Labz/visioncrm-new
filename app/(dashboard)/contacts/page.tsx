'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Mail, Phone, Building2, Car, FileText, Receipt, Star, MoreVertical, Filter, Edit, Trash2, Eye, CheckCircle2, X, User, Download, Upload, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { useLanguage } from '@/contexts/language-context';
import { useRouter } from 'next/navigation';
import { ContactModal } from '@/components/contacts/contact-modal';
import { KryptonButton } from '@/components/ui/krypton';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  is_vip: boolean;
  tags: string[];
  created_at: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  _count: {
    vehicles: number;
    quotes: number;
    invoices: number;
  };
}

export default function ContactsPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'vip' | 'with_vehicles' | 'with_quotes' | 'with_invoices'>('all');
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactModalMode, setContactModalMode] = useState<'create' | 'view' | 'edit'>('create');
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStep, setImportStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch(`/api/contacts?search=${searchQuery}`);
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContacts();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${name} ?`)) return;

    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchContacts();
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleSaveContact = async (data: any) => {
    if (contactModalMode === 'create') {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création du contact');
      }

      await fetchContacts();
    } else {
      const response = await fetch(`/api/contacts/${selectedContact?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la mise à jour du contact');
      }

      await fetchContacts();
      // Update selected contact
      const updatedContacts = await fetch('/api/contacts');
      const contactsData = await updatedContacts.json();
      const updated = contactsData.contacts.find((c: Contact) => c.id === selectedContact?.id);
      if (updated) {
        setSelectedContact(updated);
      }
    }
  };

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setContactModalMode('view');
    setShowContactModal(true);
  };

  const handleCreateNewContact = () => {
    setSelectedContact(null);
    setContactModalMode('create');
    setShowContactModal(true);
  };

  const handleExportContacts = () => {
    // Get filtered contacts
    const contactsToExport = getFilteredContacts();

    if (contactsToExport.length === 0) {
      alert('Aucun contact à exporter');
      return;
    }

    // Create CSV header
    const headers = [
      'Prénom',
      'Nom',
      'Email',
      'Téléphone',
      'Entreprise',
      'Adresse',
      'Code postal',
      'Ville',
      'Pays',
      'VIP',
      'Véhicules',
      'Devis',
      'Factures',
      'Date de création'
    ];

    // Create CSV rows
    const rows = contactsToExport.map(contact => [
      contact.first_name,
      contact.last_name,
      contact.email || '',
      contact.phone || '',
      contact.company || '',
      contact.address?.street || '',
      contact.address?.postalCode || '',
      contact.address?.city || '',
      contact.address?.country || '',
      contact.is_vip ? 'Oui' : 'Non',
      contact._count.vehicles.toString(),
      contact._count.quotes.toString(),
      contact._count.invoices.toString(),
      new Date(contact.created_at).toLocaleDateString('fr-FR')
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `contacts_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setIsImporting(true);

    try {
      // Read file
      const text = await file.text();

      // Parse CSV
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        alert('Le fichier CSV doit contenir au moins une ligne de données');
        return;
      }

      // Parse headers
      const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
      setCsvHeaders(headers);

      // Parse data rows
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.replace(/^"|"$/g, '').trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      setCsvData(rows);

      // Use AI to map columns
      await mapColumnsWithAI(headers, rows.slice(0, 3)); // Send first 3 rows as sample

      setImportStep('mapping');
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Erreur lors de la lecture du fichier CSV');
    } finally {
      setIsImporting(false);
    }
  };

  const mapColumnsWithAI = async (headers: string[], sampleRows: any[]) => {
    try {
      const response = await fetch('/api/ai/map-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headers,
          sampleData: sampleRows,
          targetFields: [
            'first_name',
            'last_name',
            'email',
            'phone',
            'company',
            'address.street',
            'address.city',
            'address.postalCode',
            'address.country'
          ]
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFieldMapping(data.mapping || {});
      } else {
        // Fallback: basic string matching
        const mapping: Record<string, string> = {};
        headers.forEach(header => {
          const lower = header.toLowerCase();
          if (lower.includes('prenom') || lower.includes('first')) mapping[header] = 'first_name';
          else if (lower.includes('nom') || lower.includes('last')) mapping[header] = 'last_name';
          else if (lower.includes('email') || lower.includes('mail')) mapping[header] = 'email';
          else if (lower.includes('tel') || lower.includes('phone')) mapping[header] = 'phone';
          else if (lower.includes('entreprise') || lower.includes('company')) mapping[header] = 'company';
          else if (lower.includes('adresse') || lower.includes('address') || lower.includes('rue')) mapping[header] = 'address.street';
          else if (lower.includes('ville') || lower.includes('city')) mapping[header] = 'address.city';
          else if (lower.includes('code') || lower.includes('postal') || lower.includes('zip')) mapping[header] = 'address.postalCode';
          else if (lower.includes('pays') || lower.includes('country')) mapping[header] = 'address.country';
        });
        setFieldMapping(mapping);
      }
    } catch (error) {
      console.error('Error mapping columns:', error);
    }
  };

  const handleImportContacts = async () => {
    if (csvData.length === 0) {
      alert('Aucune donnée à importer');
      return;
    }

    setIsImporting(true);
    try {
      // Transform CSV data to contact format
      const contactsToImport = csvData.map(row => {
        const contact: any = {
          first_name: '',
          last_name: '',
        };

        Object.entries(fieldMapping).forEach(([csvColumn, targetField]) => {
          const value = row[csvColumn];
          if (!value) return;

          if (targetField.includes('.')) {
            // Nested field (e.g., address.city)
            const [parent, child] = targetField.split('.');
            if (!contact[parent]) contact[parent] = {};
            contact[parent][child] = value;
          } else {
            contact[targetField] = value;
          }
        });

        return contact;
      }).filter(c => c.first_name && c.last_name); // Only keep valid contacts

      // Import via API
      const response = await fetch('/api/contacts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: contactsToImport }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`${result.imported} contacts importés avec succès !`);
        await fetchContacts();
        setShowImportModal(false);
        resetImportState();
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de l\'importation');
      }
    } catch (error) {
      console.error('Error importing contacts:', error);
      alert('Erreur lors de l\'importation des contacts');
    } finally {
      setIsImporting(false);
    }
  };

  const resetImportState = () => {
    setCsvFile(null);
    setCsvData([]);
    setCsvHeaders([]);
    setFieldMapping({});
    setImportStep('upload');
  };

  const getFilteredContacts = () => {
    switch (filter) {
      case 'vip':
        return contacts.filter(c => c.is_vip);
      case 'with_vehicles':
        return contacts.filter(c => c._count.vehicles > 0);
      case 'with_quotes':
        return contacts.filter(c => c._count.quotes > 0);
      case 'with_invoices':
        return contacts.filter(c => c._count.invoices > 0);
      default:
        return contacts;
    }
  };

  const filteredContacts = getFilteredContacts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-t-primary border-r-primary border-b-border border-l-border rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">{t('contacts.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('contacts.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('contacts.subtitle')}
          </p>
        </div>
        <KryptonButton
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          iconPosition="left"
          onClick={handleCreateNewContact}
        >
          {t('contacts.new_contact')}
        </KryptonButton>
      </div>

      {/* Search and Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('contacts.search_placeholder')}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  {t('contacts.filters')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  {filter === 'all' && <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />}
                  {filter !== 'all' && <div className="h-4 w-4 mr-2" />}
                  Tous les contacts
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('vip')}>
                  {filter === 'vip' && <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />}
                  {filter !== 'vip' && <div className="h-4 w-4 mr-2" />}
                  VIP uniquement
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('with_vehicles')}>
                  {filter === 'with_vehicles' && <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />}
                  {filter !== 'with_vehicles' && <div className="h-4 w-4 mr-2" />}
                  Avec véhicules
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('with_quotes')}>
                  {filter === 'with_quotes' && <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />}
                  {filter !== 'with_quotes' && <div className="h-4 w-4 mr-2" />}
                  Avec devis
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('with_invoices')}>
                  {filter === 'with_invoices' && <CheckCircle2 className="h-4 w-4 mr-2 text-primary" />}
                  {filter !== 'with_invoices' && <div className="h-4 w-4 mr-2" />}
                  Avec factures
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={handleSearch}>
              {t('contacts.search_button')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportContacts}
              disabled={filteredContacts.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter ({filteredContacts.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImportModal(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Importer CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      {filteredContacts.length > 0 ? (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('contacts.table.name')}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('contacts.table.company')}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('contacts.table.email')}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('contacts.table.phone')}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t('contacts.table.stats')}</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">{t('contacts.table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact, index) => (
                  <tr
                    key={contact.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-4">
                      <div
                        onClick={() => handleViewContact(contact)}
                        className="flex items-center gap-3 group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                          {contact.first_name[0]}{contact.last_name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {contact.first_name} {contact.last_name}
                          </p>
                          {contact.is_vip && (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-500">
                              <Star className="h-3 w-3 fill-current" />
                              {t('contacts.vip_label')}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {contact.company ? (
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {contact.company}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      {contact.email ? (
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-sm text-foreground hover:text-primary transition-colors flex items-center gap-2"
                        >
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {contact.email}
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      {contact.phone ? (
                        <a
                          href={`tel:${contact.phone}`}
                          className="text-sm text-foreground hover:text-primary transition-colors flex items-center gap-2"
                        >
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {contact.phone}
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-3 text-xs">
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Car className="h-3.5 w-3.5" />
                          {contact._count.vehicles}
                        </span>
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <FileText className="h-3.5 w-3.5" />
                          {contact._count.quotes}
                        </span>
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Receipt className="h-3.5 w-3.5" />
                          {contact._count.invoices}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewContact(contact)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/contacts/${contact.id}/edit`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(contact.id, `${contact.first_name} ${contact.last_name}`)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('contacts.empty_title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('contacts.empty_description')}
              </p>
            </div>
            <Link href="/contacts/new">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" />
                {t('contacts.create_button')}
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => {
          setShowContactModal(false);
          setSelectedContact(null);
        }}
        contact={selectedContact}
        mode={contactModalMode}
        onSave={handleSaveContact}
      />

      {/* Import CSV Modal */}
      <Dialog open={showImportModal} onOpenChange={(open) => {
        setShowImportModal(open);
        if (!open) resetImportState();
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Importer des contacts depuis un CSV
            </DialogTitle>
            <DialogDescription>
              Uploadez un fichier CSV et l'IA mappera automatiquement les colonnes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {importStep === 'upload' && (
              <div className="space-y-4">
                {/* File upload area */}
                <div className="border-2 border-dashed border-border rounded-lg p-8">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                      <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Sélectionnez un fichier CSV
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Le fichier doit contenir une ligne d'en-tête avec les noms des colonnes
                      </p>
                    </div>
                    <label htmlFor="csv-upload" className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Choisir un fichier
                        </span>
                      </Button>
                      <input
                        id="csv-upload"
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    {csvFile && (
                      <p className="text-sm text-muted-foreground">
                        Fichier sélectionné : <span className="font-medium">{csvFile.name}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2">Format attendu</h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    Votre fichier CSV doit contenir au minimum les colonnes pour le prénom et le nom. Les autres champs sont optionnels.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Exemples de colonnes : Prénom, Nom, Email, Téléphone, Entreprise, Adresse, Code postal, Ville, Pays
                  </p>
                </div>
              </div>
            )}

            {importStep === 'mapping' && (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <h4 className="text-sm font-semibold text-foreground">
                      Mapping automatique détecté
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {csvData.length} lignes détectées. Vérifiez et ajustez le mapping si nécessaire.
                  </p>
                </div>

                {/* Mapping table */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                            Colonne CSV
                          </th>
                          <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                            Exemple de données
                          </th>
                          <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                            Champ VisionCRM
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvHeaders.map((header, index) => (
                          <tr key={index} className="border-b border-border last:border-0">
                            <td className="p-3">
                              <span className="text-sm font-medium text-foreground">{header}</span>
                            </td>
                            <td className="p-3">
                              <span className="text-sm text-muted-foreground">
                                {csvData[0]?.[header] || '-'}
                              </span>
                            </td>
                            <td className="p-3">
                              <select
                                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background"
                                value={fieldMapping[header] || ''}
                                onChange={(e) => setFieldMapping({
                                  ...fieldMapping,
                                  [header]: e.target.value
                                })}
                              >
                                <option value="">-- Ignorer --</option>
                                <option value="first_name">Prénom</option>
                                <option value="last_name">Nom</option>
                                <option value="email">Email</option>
                                <option value="phone">Téléphone</option>
                                <option value="company">Entreprise</option>
                                <option value="address.street">Adresse</option>
                                <option value="address.city">Ville</option>
                                <option value="address.postalCode">Code postal</option>
                                <option value="address.country">Pays</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Preview first rows */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    Aperçu des 3 premières lignes
                  </h4>
                  <div className="space-y-2">
                    {csvData.slice(0, 3).map((row, index) => (
                      <div key={index} className="border border-border rounded-lg p-3 bg-muted/30">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(fieldMapping).map(([csvCol, targetField]) => {
                            if (!targetField) return null;
                            const displayName = targetField.includes('.')
                              ? targetField.split('.')[1]
                              : targetField;
                            return (
                              <div key={csvCol}>
                                <span className="text-muted-foreground">{displayName}: </span>
                                <span className="text-foreground font-medium">{row[csvCol] || '-'}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {isImporting && (
              <div className="flex items-center justify-center py-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-2 border-t-primary border-r-primary border-b-border border-l-border rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">
                    {importStep === 'upload' ? 'Analyse du fichier...' : 'Importation en cours...'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between gap-2 mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                if (importStep === 'mapping') {
                  setImportStep('upload');
                  resetImportState();
                } else {
                  setShowImportModal(false);
                  resetImportState();
                }
              }}
              disabled={isImporting}
            >
              {importStep === 'mapping' ? 'Retour' : 'Annuler'}
            </Button>
            {importStep === 'mapping' && (
              <Button
                onClick={handleImportContacts}
                disabled={isImporting || !Object.values(fieldMapping).some(v => v === 'first_name' || v === 'last_name')}
              >
                {isImporting ? 'Importation...' : `Importer ${csvData.length} contacts`}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
