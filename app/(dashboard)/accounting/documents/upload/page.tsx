import { Metadata } from 'next';
import { DocumentUploadForm } from '@/components/accounting/document-upload-form';

export const metadata: Metadata = {
  title: 'Ajouter un document | VisionCRM',
  description: 'Téléverser un nouveau document',
};

export default function UploadDocumentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ajouter un document</h1>
        <p className="text-muted-foreground">
          Téléversez un nouveau document fiscal, social ou juridique
        </p>
      </div>

      <DocumentUploadForm />
    </div>
  );
}
