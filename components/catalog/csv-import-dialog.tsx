'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileText, Sparkles, Check, X } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface CsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ColumnMapping {
  csvColumn: string;
  dbColumn: string;
  confidence: number;
  suggested: boolean;
}

export function CsvImportDialog({ open, onOpenChange }: CsvImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dbColumns = [
    { value: 'name', label: 'Nom du produit' },
    { value: 'reference', label: 'Référence' },
    { value: 'category', label: 'Catégorie' },
    { value: 'price', label: 'Prix' },
    { value: 'stock', label: 'Stock' },
    { value: 'description', label: 'Description' },
    { value: 'ignore', label: 'Ignorer cette colonne' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const analyzeWithAI = async () => {
    if (!file) return;

    setIsAnalyzing(true);

    // Simuler l'analyse IA (à remplacer par un vrai appel API)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Résultats simulés de l'analyse IA
    const suggestedMappings: ColumnMapping[] = [
      { csvColumn: 'Product Name', dbColumn: 'name', confidence: 0.95, suggested: true },
      { csvColumn: 'SKU', dbColumn: 'reference', confidence: 0.92, suggested: true },
      { csvColumn: 'Category', dbColumn: 'category', confidence: 0.98, suggested: true },
      { csvColumn: 'Price (EUR)', dbColumn: 'price', confidence: 0.99, suggested: true },
      { csvColumn: 'Quantity', dbColumn: 'stock', confidence: 0.88, suggested: true },
      { csvColumn: 'Details', dbColumn: 'description', confidence: 0.75, suggested: true },
    ];

    setMappings(suggestedMappings);
    setIsAnalyzing(false);
    setStep('mapping');
  };

  const handleImport = async () => {
    // TODO: Implémenter l'importation réelle
    console.log('Importing with mappings:', mappings);
    onOpenChange(false);
    resetDialog();
  };

  const resetDialog = () => {
    setFile(null);
    setMappings([]);
    setStep('upload');
  };

  const exportTemplate = () => {
    // Créer un CSV template
    const headers = ['name', 'reference', 'category', 'price', 'stock', 'description'];
    const csvContent = headers.join(',') + '\n' +
                       'Filtre à huile,FO-001,Filtres,12.50,45,Filtre de haute qualité';

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_catalogue.csv';
    a.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Import CSV avec Analyse IA
          </DialogTitle>
          <DialogDescription>
            Notre IA analyse automatiquement votre fichier CSV et mappe les colonnes à votre catalogue
          </DialogDescription>
        </DialogHeader>

        {/* Étape 1: Upload */}
        {step === 'upload' && (
          <div className="space-y-6 py-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />

              {!file ? (
                <div className="space-y-4">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium">Sélectionnez un fichier CSV</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      ou glissez-déposez le ici
                    </p>
                  </div>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Choisir un fichier
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Check className="h-16 w-16 text-green-500 mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium">{file.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={() => setFile(null)}>
                      <X className="h-4 w-4 mr-2" />
                      Retirer
                    </Button>
                    <Button onClick={analyzeWithAI} disabled={isAnalyzing}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {isAnalyzing ? 'Analyse en cours...' : 'Analyser avec IA'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Download className="h-4 w-4" />
              <button onClick={exportTemplate} className="hover:text-primary underline">
                Télécharger le template CSV
              </button>
            </div>
          </div>
        )}

        {/* Étape 2: Mapping */}
        {step === 'mapping' && (
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-medium">Notre IA a analysé votre fichier</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Vérifiez et ajustez les correspondances ci-dessous
              </p>
            </div>

            <div className="space-y-3">
              {mappings.map((mapping, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border border-border rounded-lg">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Colonne CSV</Label>
                    <p className="font-medium">{mapping.csvColumn}</p>
                  </div>

                  <div className="text-muted-foreground">→</div>

                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Champ dans le catalogue</Label>
                    <select
                      value={mapping.dbColumn}
                      onChange={(e) => {
                        const newMappings = [...mappings];
                        newMappings[index].dbColumn = e.target.value;
                        setMappings(newMappings);
                      }}
                      className="w-full border border-input rounded-md px-3 py-2 text-sm"
                    >
                      {dbColumns.map((col) => (
                        <option key={col.value} value={col.value}>
                          {col.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`text-xs font-medium px-2 py-1 rounded ${
                      mapping.confidence > 0.9 ? 'bg-green-100 text-green-700' :
                      mapping.confidence > 0.7 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {Math.round(mapping.confidence * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 'upload' && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
          )}
          {step === 'mapping' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>
                Retour
              </Button>
              <Button onClick={handleImport}>
                Importer {mappings.length} produits
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
