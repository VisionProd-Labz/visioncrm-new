// This file configures instrumentation for the server and edge runtimes.
// Sentry has been temporarily disabled - uncomment below and install @sentry/nextjs to re-enable

// Export no-op request error handler for now
export const onRequestError = (error: unknown) => {
  console.error('Request error:', error);
};

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side initialization
    console.log('Server runtime initialized');

    // Uncomment below when @sentry/nextjs is installed:
    // const Sentry = await import('@sentry/nextjs');
    // Sentry.init({
    //   dsn: process.env.SENTRY_DSN,
    //   tracesSampleRate: 1.0,
    //   debug: false,
    //   environment: process.env.NODE_ENV,
    // });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime initialization
    console.log('Edge runtime initialized');

    // Uncomment below when @sentry/nextjs is installed:
    // const Sentry = await import('@sentry/nextjs');
    // Sentry.init({
    //   dsn: process.env.SENTRY_DSN,
    //   tracesSampleRate: 1.0,
    //   debug: false,
    //   environment: process.env.NODE_ENV,
    // });
  }
}
