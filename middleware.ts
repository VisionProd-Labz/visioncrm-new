import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

// Protect these routes
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
  ],
};
