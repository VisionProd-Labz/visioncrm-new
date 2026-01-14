export { auth as middleware } from '@/auth';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/contacts/:path*',
    '/vehicles/:path*',
    '/quotes/:path*',
    '/invoices/:path*',
    '/tasks/:path*',
    '/reports/:path*',
    '/settings/:path*',
    '/catalog/:path*',
    '/planning/:path*',
    '/projects/:path*',
    '/accounting/:path*',
    '/team/:path*',
    '/communications/:path*',
    '/email/:path*',
  ],
};
