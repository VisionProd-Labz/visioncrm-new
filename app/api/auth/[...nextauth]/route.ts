import { handlers } from '@/auth';

console.log('🚀 [NEXTAUTH ROUTE V5] Auth handlers loaded');

// ✅ CORRECT: Export both GET and POST directly from NextAuth handlers
// This is the recommended approach for NextAuth v5 with Next.js 15 App Router
export const { GET, POST } = handlers;
