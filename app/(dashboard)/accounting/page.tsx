import { Metadata } from 'next';
import { Suspense } from 'react';
import { AccountingTabs } from '@/components/accounting/accounting-tabs';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Comptabilité | VisionCRM',
  description: 'Gestion comptable et financière complète',
};

export default function AccountingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Comptabilité</h1>
        <p className="text-muted-foreground">
          Gestion complète de votre comptabilité et finances
        </p>
      </div>

      <Suspense
        fallback={
          <Card>
            <CardContent className="py-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        }
      >
        <AccountingTabs />
      </Suspense>
    </div>
  );
}
