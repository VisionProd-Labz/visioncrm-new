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

  // Server-side integrations
  integrations: [
    // HTTP instrumentation
    Sentry.httpIntegration(),
  ],

  // Filter out sensitive data
  beforeSend(event) {
    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers.cookie;
      delete event.request.headers.authorization;
    }

    // Remove sensitive query params
    if (event.request?.query_string && typeof event.request.query_string === 'string') {
      const sensitiveParams = ['token', 'password', 'secret', 'key'];
      const hasSensitiveParam = sensitiveParams.some(param =>
        event.request?.query_string?.toString().includes(param)
      );
      if (hasSensitiveParam) {
        event.request.query_string = '[REDACTED]';
      }
    }

    return event;
  },

  // Error filtering
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    // Random plugins/extensions
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    // Facebook borked
    'fb_xd_fragment',
    // ISP optimizing proxy
    'bmi_SafeAddOnload',
    'EBCallBackMessageReceived',
  ],
});
