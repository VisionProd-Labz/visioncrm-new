'use client';

import { useState } from 'react';
import {
  Upload,
  FileText,
  Download,
  Eye,
  Trash2,
  Plus,
  Search,
  Filter,
  FolderOpen,
  File,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  uploadDate: string;
  size: string;
  status?: 'valid' | 'expiring' | 'expired';
}

interface DocumentsSectionProps {
  documents: Document[];
  onUpload?: () => void;
  onDelete?: (id: string) => void;
}

export function DocumentsSection({ documents, onUpload, onDelete }: DocumentsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'legal', name: 'Juridique', icon: '⚖️', count: 8, color: 'bg-blue-100 text-blue-800' },
    { id: 'fiscal', name: 'Fiscal', icon: '💰', count: 12, color: 'bg-green-100 text-green-800' },
    { id: 'insurance', name: 'Assurance', icon: '🛡️', count: 5, color: 'bg-purple-100 text-purple-800' },
    { id: 'real-estate', name: 'Immobilier', icon: '🏢', count: 3, color: 'bg-orange-100 text-orange-800' },
    { id: 'hr', name: 'RH', icon: '👥', count: 15, color: 'bg-pink-100 text-pink-800' },
    { id: 'other', name: 'Autre', icon: '📁', count: 7, color: 'bg-gray-100 text-gray-800' },
  ];

  const stats = {
    total: 50,
    recent: 8,
    expiring: 3,
    storage: '2.4 GB / 10 GB',
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'valid':
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Valide
          </Badge>
        );
      case 'expiring':
        return (
          <Badge className="bg-orange-100 text-orange-800 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Expire bientôt
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Expiré
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents totaux</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Tous types</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ajoutés récemment</CardTitle>
            <Upload className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.recent}</div>
            <p className="text-xs text-muted-foreground">Ce mois-ci</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">À renouveler</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.expiring}</div>
            <p className="text-xs text-muted-foreground">Action requise</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stockage</CardTitle>
            <FolderOpen className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{stats.storage}</div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '24%' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Zone */}
      <Card className="border-2 border-dashed hover:border-primary transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Importer des documents</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  PDF, DOC, DOCX, XLS, XLSX, JPG, PNG - Maximum 25 MB par fichier
                </p>
              </div>
            </div>
            <Button size="lg" onClick={onUpload}>
              <Plus className="h-5 w-5 mr-2" />
              Parcourir les fichiers
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Catégories</h3>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedCategory === 'all' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedCategory('all')}
          >
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">📂</div>
              <div className="font-semibold">Tous</div>
              <div className="text-2xl font-bold text-primary mt-1">{stats.total}</div>
            </CardContent>
          </Card>

          {categories.map((category) => (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCategory === category.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">{category.icon}</div>
                <div className="font-semibold text-sm">{category.name}</div>
                <div className="text-2xl font-bold text-primary mt-1">{category.count}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un document..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filtres avancés
        </Button>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {selectedCategory === 'all'
                  ? 'Tous les documents'
                  : categories.find((c) => c.id === selectedCategory)?.name}
              </CardTitle>
              <CardDescription>
                {filteredDocuments.length} document(s) trouvé(s)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun document trouvé</p>
              </div>
            ) : (
              filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <File className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{doc.name}</h4>
                        {getStatusBadge(doc.status)}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {doc.category}
                        </Badge>
                        <span>{doc.type.toUpperCase()}</span>
                        <span>•</span>
                        <span>{doc.uploadDate}</span>
                        <span>•</span>
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => onDelete?.(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Conseils pour la gestion documentaire
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-900">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
            <p>
              <strong>Organisation:</strong> Classez vos documents dès leur réception pour faciliter
              les recherches
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
            <p>
              <strong>Dates d'expiration:</strong> Configurez des alertes pour les documents à
              renouveler
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
            <p>
              <strong>Sauvegarde:</strong> Vos documents sont automatiquement sauvegardés de manière
              sécurisée
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
