'use client';

import { useState, useEffect } from 'react';
import { X, Download, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PDFPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'quote' | 'invoice';
  data: {
    id: string;
    reference: string;
    created_at: string;
    valid_until?: string;
    due_date?: string;
    status: string;
    contact: {
      first_name: string;
      last_name: string;
      company?: string | null;
      email?: string | null;
      phone?: string | null;
      address?: any;
    };
    items: Array<{
      id: string;
      description: string;
      quantity: number;
      unit_price: number;
      vat_rate: number;
    }>;
    total_ht?: number;
    total_ttc?: number;
  };
  company?: {
    name: string;
    address?: any;
    phone?: string;
    email?: string;
    siret?: string;
  };
}

export function PDFPreviewModal({ open, onOpenChange, type, data, company }: PDFPreviewModalProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (open && data) {
      generatePDF();
    }
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [open, data]);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();

      // Company info
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(company?.name || 'VisionCRM', 20, 20);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      if (company?.address) {
        doc.text(company.address.street || '', 20, 28);
        doc.text(`${company.address.postalCode || ''} ${company.address.city || ''}`, 20, 33);
      }
      if (company?.phone) doc.text(`Tél: ${company.phone}`, 20, 38);
      if (company?.email) doc.text(`Email: ${company.email}`, 20, 43);
      if (company?.siret) doc.text(`SIRET: ${company.siret}`, 20, 48);

      // Document type and reference
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      const docTitle = type === 'quote' ? 'DEVIS' : 'FACTURE';
      doc.text(docTitle, 140, 20);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Référence: ${data.reference}`, 140, 28);
      doc.text(`Date: ${new Date(data.created_at).toLocaleDateString('fr-FR')}`, 140, 33);
      if (type === 'quote' && data.valid_until) {
        doc.text(`Valable jusqu'au: ${new Date(data.valid_until).toLocaleDateString('fr-FR')}`, 140, 38);
      }
      if (type === 'invoice' && data.due_date) {
        doc.text(`Échéance: ${new Date(data.due_date).toLocaleDateString('fr-FR')}`, 140, 38);
      }
      doc.text(`Statut: ${data.status}`, 140, 43);

      // Client info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Client', 20, 65);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const clientName = data.contact.company || `${data.contact.first_name} ${data.contact.last_name}`;
      doc.text(clientName, 20, 72);
      if (!data.contact.company) {
        doc.text(`${data.contact.first_name} ${data.contact.last_name}`, 20, 77);
      }
      if (data.contact.address) {
        let y = data.contact.company ? 77 : 82;
        if (data.contact.address.street) {
          doc.text(data.contact.address.street, 20, y);
          y += 5;
        }
        if (data.contact.address.postalCode || data.contact.address.city) {
          doc.text(`${data.contact.address.postalCode || ''} ${data.contact.address.city || ''}`, 20, y);
          y += 5;
        }
        if (data.contact.address.country) {
          doc.text(data.contact.address.country, 20, y);
        }
      }

      // Items table
      const tableData = data.items.map(item => {
        const totalHT = item.quantity * item.unit_price;
        const totalTTC = totalHT * (1 + item.vat_rate / 100);
        return [
          item.description,
          item.quantity.toString(),
          `${item.unit_price.toFixed(2)} €`,
          `${item.vat_rate}%`,
          `${totalHT.toFixed(2)} €`,
          `${totalTTC.toFixed(2)} €`
        ];
      });

      autoTable(doc, {
        startY: 100,
        head: [['Description', 'Qté', 'Prix U.', 'TVA', 'Total HT', 'Total TTC']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 25, halign: 'right' },
          3: { cellWidth: 20, halign: 'center' },
          4: { cellWidth: 30, halign: 'right' },
          5: { cellWidth: 30, halign: 'right' }
        }
      });

      // Totals
      const finalY = (doc as any).lastAutoTable.finalY || 150;

      // Calculate totals
      let totalHT = 0;
      let totalTVA = 0;
      let totalTTC = 0;

      data.items.forEach(item => {
        const itemHT = item.quantity * item.unit_price;
        const itemTVA = itemHT * (item.vat_rate / 100);
        totalHT += itemHT;
        totalTVA += itemTVA;
        totalTTC += itemHT + itemTVA;
      });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Total HT:', 130, finalY + 10);
      doc.text(`${totalHT.toFixed(2)} €`, 185, finalY + 10, { align: 'right' });

      doc.text('TVA:', 130, finalY + 16);
      doc.text(`${totalTVA.toFixed(2)} €`, 185, finalY + 16, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Total TTC:', 130, finalY + 24);
      doc.text(`${totalTTC.toFixed(2)} €`, 185, finalY + 24, { align: 'right' });

      // Footer
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(128);
      const footerText = type === 'quote'
        ? 'Ce devis est valable 30 jours à compter de sa date d\'émission.'
        : 'Paiement à réception de facture. Tout retard de paiement entraînera des pénalités.';
      doc.text(footerText, 105, 280, { align: 'center' });

      // Convert to blob URL
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${type === 'quote' ? 'devis' : 'facture'}_${data.reference}.pdf`;
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                {type === 'quote' ? 'Aperçu du devis' : 'Aperçu de la facture'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {data.reference}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!pdfUrl || isGenerating}
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Génération du PDF...</p>
            </div>
          ) : pdfUrl ? (
            <div className="border border-border rounded-lg overflow-hidden" style={{ height: '70vh' }}>
              <iframe
                src={pdfUrl}
                className="w-full h-full"
                title="PDF Preview"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Impossible de générer le PDF</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
