'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import { LanguageProvider } from '@/contexts/language-context';
import { ErrorBoundary } from '@/components/error-boundary';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <LanguageProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </LanguageProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
