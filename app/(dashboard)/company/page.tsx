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
import { DocumentsSection } from '@/components/company/documents-section';

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

  const handleSaveCompanyInfo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const formData = new FormData(e.currentTarget);

      const payload = {
        company_name: formData.get('companyName') as string,
        company_siret: formData.get('siret') as string,
        company_tva: formData.get('tva') as string,
        company_address: formData.get('address') as string,
        company_info: {
          legal_form: formData.get('legalForm') as string,
          city: formData.get('city') as string,
          zipcode: formData.get('zipCode') as string,
          email: formData.get('companyEmail') as string,
          phone: formData.get('companyPhone') as string,
          website: formData.get('website') as string,
          description: formData.get('description') as string,
          capital: formData.get('capital') as string,
          creation_date: formData.get('creationDate') as string,
        },
      };

      const response = await fetch('/api/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save company info');
      }

      const updatedData = await response.json();
      setCompanyInfo(updatedData);

      // Show success message
      alert('Informations de l\'entreprise sauvegardées avec succès');
    } catch (error) {
      console.error('Error saving company info:', error);
      alert('Erreur lors de la sauvegarde des informations');
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
          <form onSubmit={handleSaveCompanyInfo} className="space-y-6">
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
                    name="companyName"
                    defaultValue={companyInfo?.company_name || ''}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legalForm">{t('company.legal_form')}</Label>
                  <Input
                    id="legalForm"
                    name="legalForm"
                    defaultValue={companyInfo?.company_info?.legal_form || ''}
                    placeholder="Ex: SARL, SAS, EURL..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siret">{t('company.siret')}</Label>
                  <Input
                    id="siret"
                    name="siret"
                    defaultValue={companyInfo?.company_siret || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tva">{t('company.tva')}</Label>
                  <Input
                    id="tva"
                    name="tva"
                    defaultValue={companyInfo?.company_tva || ''}
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
                    name="address"
                    className="pl-10"
                    defaultValue={companyInfo?.company_address || ''}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">{t('company.city')}</Label>
                  <Input id="city" name="city" defaultValue={companyInfo?.company_info?.city || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">{t('company.zipcode')}</Label>
                  <Input id="zipCode" name="zipCode" defaultValue={companyInfo?.company_info?.zipcode || ''} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">{t('company.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="companyEmail"
                      name="companyEmail"
                      type="email"
                      className="pl-10"
                      defaultValue={companyInfo?.company_info?.email || ''}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">{t('company.phone')}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="companyPhone"
                      name="companyPhone"
                      className="pl-10"
                      defaultValue={companyInfo?.company_info?.phone || ''}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">{t('company.website')}</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  defaultValue={companyInfo?.company_info?.website || ''}
                  placeholder="https://www.masociete.fr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('company.description')}</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  defaultValue={companyInfo?.company_info?.description || ''}
                  placeholder="Décrivez votre activité principale..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capital">{t('company.capital')}</Label>
                  <Input
                    id="capital"
                    name="capital"
                    type="number"
                    defaultValue={companyInfo?.company_info?.capital || ''}
                    placeholder="Ex: 10000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creationDate">{t('company.creation_date')}</Label>
                  <Input
                    id="creationDate"
                    name="creationDate"
                    type="date"
                    defaultValue={companyInfo?.company_info?.creation_date || ''}
                  />
                </div>
              </div>

              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Save className="mr-2 h-4 w-4" />
                {t('company.save')}
              </Button>
            </div>
          </form>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <DocumentsSection
            documents={documents}
            onUpload={() => {
              // TODO: Implement upload logic
              console.log('Upload clicked');
            }}
            onDelete={(id) => {
              // TODO: Implement delete logic
              console.log('Delete document:', id);
            }}
          />
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
