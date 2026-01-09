import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Download, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Documents | VisionCRM',
  description: 'Gestion des documents fiscaux, sociaux et juridiques',
};

// TODO: Fetch from API
async function getDocuments() {
  // Placeholder data
  const documents = [
    {
      id: '1',
      category: 'TAX',
      type: 'TVA_RETURN',
      period: 'Q4',
      year: 2025,
      file_name: 'TVA_Q4_2025.pdf',
      file_url: 'https://example.com/tva_q4_2025.pdf',
      file_size: 234567,
      created_at: new Date('2025-12-28'),
    },
    {
      id: '2',
      category: 'TAX',
      type: 'FEC',
      period: 'ANNUEL',
      year: 2025,
      file_name: 'FEC_2025.txt',
      file_url: 'https://example.com/fec_2025.txt',
      file_size: 1234567,
      created_at: new Date('2025-12-15'),
    },
    {
      id: '3',
      category: 'PAYROLL',
      type: 'URSSAF',
      period: 'DECEMBRE',
      year: 2025,
      file_name: 'URSSAF_DEC_2025.pdf',
      file_url: 'https://example.com/urssaf_dec_2025.pdf',
      file_size: 456789,
      created_at: new Date('2025-12-20'),
    },
    {
      id: '4',
      category: 'LEGAL',
      type: 'AGO_PV',
      document_date: new Date('2025-06-15'),
      year: 2025,
      file_name: 'PV_AGO_2025.pdf',
      file_url: 'https://example.com/pv_ago_2025.pdf',
      file_size: 345678,
      created_at: new Date('2025-06-16'),
    },
  ];

  const stats = {
    totalDocuments: documents.length,
    taxDocuments: documents.filter(d => d.category === 'TAX').length,
    payrollDocuments: documents.filter(d => d.category === 'PAYROLL').length,
    legalDocuments: documents.filter(d => d.category === 'LEGAL').length,
  };

  return { documents, stats };
}

const categoryConfig = {
  TAX: { label: 'Fiscal', variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
  PAYROLL: { label: 'Social', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
  LEGAL: { label: 'Juridique', variant: 'default' as const, color: 'bg-purple-100 text-purple-800' },
};

const typeLabels: Record<string, string> = {
  // Tax types
  TVA_RETURN: 'Déclaration TVA',
  CORPORATE_TAX: 'Impôt sur les sociétés',
  INCOME_TAX: 'Impôt sur le revenu',
  PAYROLL_TAX: 'Taxe sur les salaires',
  PROPERTY_TAX: 'Taxe foncière',
  FEC: 'Fichier des écritures comptables',
  LIASSE_FISCALE: 'Liasse fiscale',
  // Payroll types
  URSSAF: 'URSSAF',
  PENSION_FUND: 'Caisse de retraite',
  HEALTH_INSURANCE: 'Mutuelle',
  PAYSLIPS: 'Bulletins de paie',
  DSN: 'DSN',
  SOCIAL_BALANCE: 'Bilan social',
  // Legal types
  AGO_PV: 'PV d\'AGO',
  AGE_PV: 'PV d\'AGE',
  STATUTES: 'Statuts',
  KBIS: 'Extrait Kbis',
  RCM_DECLARATION: 'Déclaration RCM',
  BOARD_DECISION: 'Décision du conseil',
  OTHER: 'Autre',
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default async function DocumentsPage() {
  const { documents, stats } = await getDocuments();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Gestion centralisée des documents fiscaux, sociaux et juridiques
          </p>
        </div>
        <Link href="/accounting/documents/upload">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un document
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Tous types confondus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents fiscaux</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.taxDocuments}</div>
            <p className="text-xs text-muted-foreground">
              TVA, FEC, liasses fiscales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents sociaux</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.payrollDocuments}</div>
            <p className="text-xs text-muted-foreground">
              URSSAF, DSN, bulletins de paie
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents juridiques</CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.legalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              PV d'AGO, Kbis, statuts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {documents.map((doc) => {
          const config = categoryConfig[doc.category as keyof typeof categoryConfig];

          return (
            <Card key={doc.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{doc.file_name}</CardTitle>
                      <Badge className={config.color}>
                        {config.label}
                      </Badge>
                    </div>
                    <CardDescription>
                      {typeLabels[doc.type] || doc.type} • {doc.period || ''} {doc.year}
                    </CardDescription>
                  </div>
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4"
                  >
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger
                    </Button>
                  </a>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>{formatFileSize(doc.file_size)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Ajouté le {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {documents.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Aucun document enregistré</p>
            <p className="text-sm text-muted-foreground mb-4">
              Commencez par ajouter vos premiers documents
            </p>
            <Link href="/accounting/documents/upload">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un document
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
