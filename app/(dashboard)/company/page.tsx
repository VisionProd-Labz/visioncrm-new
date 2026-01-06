'use client';

import { useState, useEffect } from 'react';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Save,
  Upload,
  FileText,
  Folder,
  Download,
  Trash2,
  Eye,
  Plus,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/language-context';
import { VatRatesSettings } from '@/components/company/vat-rates-settings';
import { PaymentMethodsSettings } from '@/components/company/payment-methods-settings';
import { PaymentTermsSettings } from '@/components/company/payment-terms-settings';
import { TaskCategoriesSettings } from '@/components/company/task-categories-settings';
import { RegionalSettings } from '@/components/company/regional-settings';

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  uploadDate: string;
  size: string;
}

export default function CompanyPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'info' | 'documents' | 'configuration'>('info');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customCategories, setCustomCategories] = useState<string[]>(['Légal', 'Fiscal', 'Assurance', 'Immobilier', 'RH', 'Autre']);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  useEffect(() => {
    if (activeTab === 'documents') {
      fetchDocuments();
    }
  }, [activeTab, selectedCategory]);

  const fetchCompanyInfo = async () => {
    try {
      const response = await fetch('/api/company');

      if (!response.ok) {
        throw new Error('Failed to fetch company info');
      }

      const data = await response.json();
      setCompanyInfo(data);
    } catch (error) {
      console.error('Error fetching company info:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/company/documents?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();

      // Transform API documents to component format
      const transformedDocs: Document[] = data.documents.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        type: doc.file_type,
        category: doc.category,
        uploadDate: new Date(doc.created_at).toISOString().split('T')[0],
        size: formatFileSize(doc.file_size),
      }));

      setDocuments(transformedDocs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const filteredDocuments = selectedCategory === 'all'
    ? documents
    : documents.filter(doc => doc.category === selectedCategory);

  const addCustomCategory = () => {
    if (newCategoryName.trim() && !customCategories.includes(newCategoryName.trim())) {
      setCustomCategories([...customCategories, newCategoryName.trim()]);
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('company.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('company.subtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'info'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {t('company.tab.info')}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'documents'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t('company.tab.documents')}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('configuration')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'configuration'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {t('company.tab.configuration')}
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-card border border-border rounded-lg p-6">
        {/* Informations Tab */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="space-y-4">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>{t('company.logo')}</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-lg bg-muted border border-border flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    {t('company.upload_logo')}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">{t('company.name')} *</Label>
                  <Input
                    id="companyName"
                    defaultValue="Ma Société SARL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legalForm">{t('company.legal_form')}</Label>
                  <Input
                    id="legalForm"
                    defaultValue="SARL"
                    placeholder="Ex: SARL, SAS, EURL..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siret">{t('company.siret')}</Label>
                  <Input
                    id="siret"
                    defaultValue="123 456 789 00012"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tva">{t('company.tva')}</Label>
                  <Input
                    id="tva"
                    placeholder="FR12345678901"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{t('company.address')}</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    className="pl-10"
                    defaultValue="12 Avenue de la République, 75011 Paris"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">{t('company.city')}</Label>
                  <Input id="city" defaultValue="Paris" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">{t('company.zipcode')}</Label>
                  <Input id="zipCode" defaultValue="75011" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">{t('company.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="companyEmail"
                      type="email"
                      className="pl-10"
                      defaultValue="contact@masociete.fr"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">{t('company.phone')}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="companyPhone"
                      className="pl-10"
                      defaultValue="+33 1 23 45 67 89"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">{t('company.website')}</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://www.masociete.fr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('company.description')}</Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Décrivez votre activité principale..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capital">{t('company.capital')}</Label>
                  <Input
                    id="capital"
                    type="number"
                    placeholder="Ex: 10000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creationDate">{t('company.creation_date')}</Label>
                  <Input
                    id="creationDate"
                    type="date"
                  />
                </div>
              </div>

              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Save className="mr-2 h-4 w-4" />
                {t('company.save')}
              </Button>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{t('company.documents.upload')}</h3>
                    <p className="text-sm text-muted-foreground">
                      PDF, DOC, DOCX, JPG, PNG - Max 10 MB
                    </p>
                  </div>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Parcourir
                </Button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Catégories</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddCategory(!showAddCategory)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Nouvelle catégorie
                </Button>
              </div>

              {showAddCategory && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomCategory()}
                    placeholder="Nom de la catégorie"
                    className="flex h-8 w-full rounded-md border border-border bg-background px-3 py-1 text-sm"
                  />
                  <Button size="sm" onClick={addCustomCategory}>
                    Ajouter
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowAddCategory(false);
                      setNewCategoryName('');
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  {t('company.documents.all')}
                  <span className="ml-1.5 text-xs opacity-60">({documents.length})</span>
                </Button>
                {customCategories.map((cat) => {
                  const count = documents.filter(doc => doc.category === cat).length;
                  return (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                      <span className="ml-1.5 text-xs opacity-60">({count})</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Documents List */}
            <div className="space-y-2">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{doc.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="px-2 py-0.5 bg-muted rounded">{doc.category}</span>
                        <span>{doc.uploadDate}</span>
                        <span>{doc.size}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredDocuments.length === 0 && (
              <div className="text-center py-12">
                <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {selectedCategory === 'all'
                    ? t('company.documents.no_documents')
                    : `Aucun document dans la catégorie "${selectedCategory}"`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Configuration Tab */}
        {activeTab === 'configuration' && (
          <div className="space-y-8">
            <RegionalSettings />
            <div className="border-t border-border pt-8">
              <VatRatesSettings />
            </div>
            <div className="border-t border-border pt-8">
              <PaymentMethodsSettings />
            </div>
            <div className="border-t border-border pt-8">
              <PaymentTermsSettings />
            </div>
            <div className="border-t border-border pt-8">
              <TaskCategoriesSettings />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
