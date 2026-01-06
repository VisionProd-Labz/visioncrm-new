'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

interface ExtractedData {
  type: 'quote' | 'invoice';
  reference: string;
  date: string;
  client: string;
  amount: number;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  confidence: number;
}

interface PdfImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'quotes' | 'invoices';
}

export function PdfImportDialog({ open, onOpenChange, type }: PdfImportDialogProps) {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
      setExtractedData(null);
    } else {
      setError('Veuillez sélectionner un fichier PDF valide');
    }
  };

  const analyzeDocument = async () => {
    if (!file) return;

    setAnalyzing(true);
    setError(null);

    // Simulate AI analysis (2-3 seconds)
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Mock extracted data with realistic values
    const mockData: ExtractedData = {
      type: type === 'quotes' ? 'quote' : 'invoice',
      reference: type === 'quotes' ? 'DEV-2024-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0') : 'FAC-2024-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
      date: new Date().toISOString().split('T')[0],
      client: 'Jean Dupont',
      amount: 1450.50,
      items: [
        { description: 'Révision complète', quantity: 1, unitPrice: 350.00, total: 350.00 },
        { description: 'Filtre à huile', quantity: 1, unitPrice: 25.50, total: 25.50 },
        { description: 'Huile moteur 5W30 (5L)', quantity: 1, unitPrice: 45.00, total: 45.00 },
        { description: 'Main d\'œuvre', quantity: 2, unitPrice: 65.00, total: 130.00 },
      ],
      confidence: 0.92,
    };

    setExtractedData(mockData);
    setAnalyzing(false);
  };

  const handleImport = () => {
    if (!extractedData) return;

    // Here you would actually import the data to your database
    console.log('Importing:', extractedData);

    // Reset and close
    setFile(null);
    setExtractedData(null);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFile(null);
    setExtractedData(null);
    setError(null);
    setAnalyzing(false);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Import PDF {type === 'quotes' ? 'Devis' : 'Facture'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              L'IA va analyser le document et extraire les données
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* File Upload */}
          {!file && !extractedData && (
            <div className="border-2 border-dashed border-border rounded-lg p-12">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">
                    Télécharger un fichier PDF
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Glissez-déposez ou cliquez pour sélectionner
                  </p>
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button type="button" onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}>
                    Parcourir
                  </Button>
                </label>
              </div>
            </div>
          )}

          {/* File Selected */}
          {file && !extractedData && !analyzing && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
                <FileText className="h-10 w-10 text-red-500" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setFile(null)}>
                  Retirer
                </Button>
              </div>

              <Button className="w-full" onClick={analyzeDocument}>
                <Upload className="mr-2 h-4 w-4" />
                Analyser avec l'IA
              </Button>
            </div>
          )}

          {/* Analyzing */}
          {analyzing && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
              <div>
                <p className="font-medium text-foreground">Analyse en cours...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  L'IA extrait les données du document
                </p>
              </div>
            </div>
          )}

          {/* Extracted Data */}
          {extractedData && (
            <div className="space-y-6">
              {/* Confidence Score */}
              <div className={`p-4 rounded-lg border ${
                extractedData.confidence > 0.9
                  ? 'bg-green-500/10 border-green-500/50'
                  : extractedData.confidence > 0.7
                  ? 'bg-yellow-500/10 border-yellow-500/50'
                  : 'bg-red-500/10 border-red-500/50'
              }`}>
                <div className="flex items-center gap-2">
                  {extractedData.confidence > 0.9 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">
                      Confiance: {(extractedData.confidence * 100).toFixed(0)}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {extractedData.confidence > 0.9
                        ? 'Les données extraites sont très fiables'
                        : 'Veuillez vérifier les données extraites'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Extracted Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Référence</label>
                    <input
                      type="text"
                      value={extractedData.reference}
                      onChange={(e) => setExtractedData({ ...extractedData, reference: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Date</label>
                    <input
                      type="date"
                      value={extractedData.date}
                      onChange={(e) => setExtractedData({ ...extractedData, date: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Client</label>
                    <input
                      type="text"
                      value={extractedData.client}
                      onChange={(e) => setExtractedData({ ...extractedData, client: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Montant total</label>
                    <input
                      type="number"
                      value={extractedData.amount}
                      onChange={(e) => setExtractedData({ ...extractedData, amount: parseFloat(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                    />
                  </div>
                </div>

                {/* Items Table */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Articles</label>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-2 text-xs font-medium">Description</th>
                          <th className="text-right p-2 text-xs font-medium">Qté</th>
                          <th className="text-right p-2 text-xs font-medium">Prix U.</th>
                          <th className="text-right p-2 text-xs font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {extractedData.items.map((item, index) => (
                          <tr key={index} className="border-t border-border">
                            <td className="p-2 text-sm">{item.description}</td>
                            <td className="p-2 text-sm text-right">{item.quantity}</td>
                            <td className="p-2 text-sm text-right">{item.unitPrice.toFixed(2)} €</td>
                            <td className="p-2 text-sm text-right font-medium">{item.total.toFixed(2)} €</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-muted border-t-2 border-border">
                        <tr>
                          <td colSpan={3} className="p-2 text-sm font-medium text-right">Total</td>
                          <td className="p-2 text-sm font-bold text-right">
                            {extractedData.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)} €
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button variant="outline" onClick={handleCancel} className="flex-1">
                  Annuler
                </Button>
                <Button onClick={handleImport} className="flex-1">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Importer
                </Button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/50">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
