'use client';

import { Plus, FileText, Download, Eye, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function DocumentsTab() {
  // TODO: Fetch real data from API
  const stats = {
    total: 45,
    pending: 3,
    submitted: 12,
    archived: 30,
  };

  const documents = [
    {
      id: '1',
      type: 'tax',
      name: 'Déclaration TVA - Décembre 2025',
      category: 'Fiscal',
      date: new Date('2025-12-31'),
      due_date: new Date('2026-01-15'),
      status: 'pending',
      file_url: '/documents/tva-dec-2025.pdf',
    },
    {
      id: '2',
      type: 'payroll',
      name: 'Bulletin de salaire - Janvier 2026',
      category: 'Social',
      date: new Date('2026-01-05'),
      due_date: null,
      status: 'submitted',
      file_url: '/documents/payroll-jan-2026.pdf',
    },
    {
      id: '3',
      type: 'legal',
      name: 'Contrat de location atelier',
      category: 'Juridique',
      date: new Date('2025-01-01'),
      due_date: null,
      status: 'archived',
      file_url: '/documents/lease-contract.pdf',
    },
  ];

  const categoryColors: Record<string, string> = {
    Fiscal: 'bg-blue-100 text-blue-800',
    Social: 'bg-purple-100 text-purple-800',
    Juridique: 'bg-green-100 text-green-800',
  };

  const statusConfig = {
    pending: { label: 'À transmettre', color: 'bg-orange-100 text-orange-800' },
    submitted: { label: 'Transmis', color: 'bg-blue-100 text-blue-800' },
    archived: { label: 'Archivé', color: 'bg-gray-100 text-gray-800' },
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Tous statuts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">À transmettre</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Action requise</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transmis</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.submitted}</div>
            <p className="text-xs text-muted-foreground">En traitement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archivés</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.archived}</div>
            <p className="text-xs text-muted-foreground">Classés</p>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-base">Documents fiscaux</CardTitle>
            <CardDescription>
              Déclarations TVA, impôts, taxes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-bold">15</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-base">Documents sociaux</CardTitle>
            <CardDescription>
              Paie, URSSAF, retraite
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-bold">18</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="text-base">Documents juridiques</CardTitle>
            <CardDescription>
              Contrats, statuts, AGO/AGE
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-bold">12</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Documents récents</CardTitle>
              <CardDescription>
                Derniers documents ajoutés ou modifiés
              </CardDescription>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documents.map((doc) => {
              const status = statusConfig[doc.status as keyof typeof statusConfig];
              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{doc.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[doc.category]}`}>
                          {doc.category}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>Date: {doc.date.toLocaleDateString('fr-FR')}</span>
                        {doc.due_date && (
                          <>
                            <span>•</span>
                            <span>
                              À transmettre avant: {doc.due_date.toLocaleDateString('fr-FR')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Voir
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
