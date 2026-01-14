// This file configures the initialization of client-side instrumentation.
// Sentry has been temporarily disabled - uncomment below and install @sentry/nextjs to re-enable

// Export no-op router transition hook for now
export const onRouterTransitionStart = () => {
  // No-op until Sentry is installed
};

// Uncomment below when @sentry/nextjs is installed:
// import * as Sentry from '@sentry/nextjs';
//
// export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
//
// Sentry.init({
//   dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
//   tracesSampleRate: 1.0,
//   debug: false,
//   replaysOnErrorSampleRate: 1.0,
//   replaysSessionSampleRate: 0.1,
//   integrations: [
//     Sentry.replayIntegration({
//       maskAllText: true,
//       blockAllMedia: true,
//     }),
//   ],
//   environment: process.env.NODE_ENV,
//   ignoreErrors: [
//     'top.GLOBALS',
//     'originalCreateNotification',
//     'canvas.contentDocument',
//     'MyApp_RemoveAllHighlights',
//     'fb_xd_fragment',
//     'bmi_SafeAddOnload',
//     'EBCallBackMessageReceived',
//     'conduitPage',
//   ],
//   beforeSend(event, hint) {
//     if (event.exception && process.env.NODE_ENV === 'production') {
//       Sentry.showReportDialog({ eventId: event.event_id });
//     }
//     return event;
//   },
// });
