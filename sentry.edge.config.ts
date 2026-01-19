import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Enabled only in production
  enabled: process.env.NODE_ENV === 'production',

  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA,

  // Edge runtime specific configuration
  // Minimal configuration due to edge runtime constraints
});
