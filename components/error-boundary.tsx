'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console (Sentry disabled)
    console.error('Error caught by boundary:', error, {
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Oups ! Une erreur s'est produite
              </h1>
              <p className="text-muted-foreground">
                Nous sommes désolés, quelque chose s'est mal passé. L'erreur a été signalée et nous y travaillons.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-muted p-4 rounded-lg text-left">
                <p className="text-sm font-mono text-destructive">
                  {this.state.error.message}
                </p>
                <pre className="mt-2 text-xs text-muted-foreground overflow-auto max-h-40">
                  {this.state.error.stack}
                </pre>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => window.location.reload()}
                variant="default"
              >
                Recharger la page
              </Button>
              <Button
                onClick={() => window.location.href = '/dashboard'}
                variant="outline"
              >
                Retour au dashboard
              </Button>
            </div>

            {process.env.NODE_ENV === 'production' && (
              <p className="text-xs text-muted-foreground">
                Code d'erreur: {this.state.error?.message?.substring(0, 8) || 'UNKNOWN'}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook to manually capture errors
export function useErrorHandler() {
  return React.useCallback((error: Error, errorInfo?: any) => {
    // Log error to console (Sentry disabled)
    console.error('Error captured manually:', error, errorInfo);
  }, []);
}
