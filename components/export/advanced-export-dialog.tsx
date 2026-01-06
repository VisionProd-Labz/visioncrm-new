'use client';

import { useState } from 'react';
import { Download, Calendar, FileText, File, X, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';

interface AdvancedExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'quotes' | 'invoices' | 'contacts' | 'vehicles';
}

type ExportMode = 'period' | 'selection';
type Period = 'day' | 'week' | 'month' | 'year' | 'custom';
type Format = 'csv' | 'pdf' | 'excel';

export function AdvancedExportDialog({ open, onOpenChange, type }: AdvancedExportDialogProps) {
  const { t } = useLanguage();
  const [exportMode, setExportMode] = useState<ExportMode>('period');
  const [period, setPeriod] = useState<Period>('month');
  const [format, setFormat] = useState<Format>('csv');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Available columns based on type
  const getAvailableColumns = () => {
    switch (type) {
      case 'quotes':
        return [
          { id: 'reference', label: 'Référence', checked: true },
          { id: 'date', label: 'Date', checked: true },
          { id: 'client', label: 'Client', checked: true },
          { id: 'amount', label: 'Montant', checked: true },
          { id: 'status', label: 'Statut', checked: true },
          { id: 'validUntil', label: 'Valide jusqu\'au', checked: false },
          { id: 'items', label: 'Articles', checked: false },
        ];
      case 'invoices':
        return [
          { id: 'reference', label: 'Référence', checked: true },
          { id: 'date', label: 'Date', checked: true },
          { id: 'client', label: 'Client', checked: true },
          { id: 'amount', label: 'Montant', checked: true },
          { id: 'status', label: 'Statut', checked: true },
          { id: 'dueDate', label: 'Date d\'échéance', checked: false },
          { id: 'paid', label: 'Payé', checked: true },
        ];
      case 'contacts':
        return [
          { id: 'name', label: 'Nom', checked: true },
          { id: 'email', label: 'Email', checked: true },
          { id: 'phone', label: 'Téléphone', checked: true },
          { id: 'company', label: 'Entreprise', checked: false },
          { id: 'address', label: 'Adresse', checked: false },
          { id: 'created', label: 'Date de création', checked: false },
        ];
      case 'vehicles':
        return [
          { id: 'registration', label: 'Immatriculation', checked: true },
          { id: 'brand', label: 'Marque', checked: true },
          { id: 'model', label: 'Modèle', checked: true },
          { id: 'year', label: 'Année', checked: false },
          { id: 'owner', label: 'Propriétaire', checked: true },
          { id: 'vin', label: 'VIN', checked: false },
        ];
      default:
        return [];
    }
  };

  const [columns, setColumns] = useState(getAvailableColumns());

  const toggleColumn = (id: string) => {
    setColumns(columns.map(col =>
      col.id === id ? { ...col, checked: !col.checked } : col
    ));
  };

  const selectAllColumns = () => {
    setColumns(columns.map(col => ({ ...col, checked: true })));
  };

  const deselectAllColumns = () => {
    setColumns(columns.map(col => ({ ...col, checked: false })));
  };

  const getPeriodDates = () => {
    const today = new Date();
    const start = new Date();
    const end = new Date();

    switch (period) {
      case 'day':
        return { start: today, end: today };
      case 'week':
        start.setDate(today.getDate() - 7);
        return { start, end };
      case 'month':
        start.setMonth(today.getMonth() - 1);
        return { start, end };
      case 'year':
        start.setFullYear(today.getFullYear() - 1);
        return { start, end };
      default:
        return { start: new Date(startDate), end: new Date(endDate) };
    }
  };

  const handleExport = () => {
    const selectedColumns = columns.filter(col => col.checked);

    if (selectedColumns.length === 0) {
      alert('Veuillez sélectionner au moins une colonne');
      return;
    }

    const exportData = {
      type,
      mode: exportMode,
      format,
      columns: selectedColumns.map(col => col.id),
      ...(exportMode === 'period' && {
        period,
        dates: period === 'custom' ? { startDate, endDate } : getPeriodDates(),
      }),
    };

    console.log('Exporting:', exportData);

    // Simulate export
    const filename = `${type}_export_${new Date().toISOString().split('T')[0]}.${format}`;

    // Create mock CSV content
    if (format === 'csv') {
      const headers = selectedColumns.map(col => col.label).join(',');
      const mockData = [
        headers,
        selectedColumns.map(col => `Valeur ${col.label}`).join(','),
      ].join('\n');

      const blob = new Blob([mockData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
    }

    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Export avancé
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configurez votre export personnalisé
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Export Mode */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Mode d'export
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setExportMode('period')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  exportMode === 'period'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Calendar className="h-5 w-5 mb-2 mx-auto text-primary" />
                <p className="text-sm font-medium text-foreground">Par période</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Exporter sur une période donnée
                </p>
              </button>
              <button
                onClick={() => setExportMode('selection')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  exportMode === 'selection'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <CheckSquare className="h-5 w-5 mb-2 mx-auto text-primary" />
                <p className="text-sm font-medium text-foreground">Sélection</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Exporter des éléments spécifiques
                </p>
              </button>
            </div>
          </div>

          {/* Period Selection */}
          {exportMode === 'period' && (
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                Période
              </label>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { value: 'day', label: 'Jour' },
                  { value: 'week', label: 'Semaine' },
                  { value: 'month', label: 'Mois' },
                  { value: 'year', label: 'Année' },
                ].map((p) => (
                  <Button
                    key={p.value}
                    variant={period === p.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPeriod(p.value as Period)}
                  >
                    {p.label}
                  </Button>
                ))}
              </div>
              <Button
                variant={period === 'custom' ? 'default' : 'outline'}
                size="sm"
                className="w-full"
                onClick={() => setPeriod('custom')}
              >
                Période personnalisée
              </Button>

              {period === 'custom' && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Date de début
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Format Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Format d'export
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'csv', label: 'CSV', icon: FileText },
                { value: 'pdf', label: 'PDF', icon: File },
                { value: 'excel', label: 'Excel', icon: FileText },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.value}
                    onClick={() => setFormat(f.value as Format)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      format === f.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mb-1 mx-auto text-primary" />
                    <p className="text-sm font-medium text-foreground">{f.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Columns Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-foreground">
                Colonnes à exporter
              </label>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAllColumns}
                  className="text-xs"
                >
                  Tout sélectionner
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={deselectAllColumns}
                  className="text-xs"
                >
                  Tout désélectionner
                </Button>
              </div>
            </div>
            <div className="border border-border rounded-lg divide-y divide-border max-h-60 overflow-y-auto">
              {columns.map((column) => (
                <button
                  key={column.id}
                  onClick={() => toggleColumn(column.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
                >
                  {column.checked ? (
                    <CheckSquare className="h-4 w-4 text-primary flex-shrink-0" />
                  ) : (
                    <Square className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="text-sm text-foreground">{column.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm text-foreground">
              <strong>Résumé:</strong> {columns.filter(c => c.checked).length} colonne(s) •
              {exportMode === 'period' ? ` ${period === 'custom' ? 'Période personnalisée' : period}` : ' Sélection'} •
              {' '} Format {format.toUpperCase()}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Annuler
            </Button>
            <Button onClick={handleExport} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
