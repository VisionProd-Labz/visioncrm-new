import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Replay configuration (optional - disable if performance is a concern)
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Enabled only in production
  enabled: process.env.NODE_ENV === 'production',

  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Filter out low-priority errors
  beforeSend(event, hint) {
    // Don't send errors from localhost in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }

    // Filter out common non-critical errors
    const error = hint.originalException;
    if (error && typeof error === 'object') {
      const message = (error as Error).message;

      // Ignore network errors (user offline)
      if (message?.includes('Failed to fetch') || message?.includes('NetworkError')) {
        return null;
      }

      // Ignore cancelled requests
      if (message?.includes('cancelled') || message?.includes('aborted')) {
        return null;
      }
    }

    return event;
  },
});
