import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import { prisma } from './lib/prisma';
import bcrypt from 'bcryptjs';
import type { User } from 'next-auth';

console.log('🔧 [AUTH.TS V5] Loading auth configuration...');

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<User | null> {
        console.log('🔑 [AUTHORIZE V5] ========== CALLED ==========');
        console.log('🔑 [AUTHORIZE V5] Email:', credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log('🔑 [AUTHORIZE V5] Missing credentials');
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          const user = await prisma.user.findUnique({
            where: { email },
            include: { tenant: true },
          });

          console.log('🔑 [AUTHORIZE V5] User found:', !!user);

          if (!user || !user.password) {
            console.log('🔑 [AUTHORIZE V5] User not found or no password');
            return null;
          }

          const isPasswordValid = await bcrypt.compare(password, user.password);

          console.log('🔑 [AUTHORIZE V5] Password valid:', isPasswordValid);

          if (!isPasswordValid) {
            console.log('🔑 [AUTHORIZE V5] Invalid password');
            return null;
          }

          // Check if tenant is active
          if (user.tenant?.deleted_at) {
            console.log('🔑 [AUTHORIZE V5] Tenant deleted');
            return null;
          }

          if (!user.tenantId) {
            console.log('🔑 [AUTHORIZE V5] No tenantId');
            return null;
          }

          const userObject = {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            tenantId: user.tenantId,
            role: user.role,
          };

          console.log('🔑 [AUTHORIZE V5] Returning user:', {
            id: userObject.id,
            email: userObject.email,
            tenantId: userObject.tenantId,
            role: userObject.role,
          });

          return userObject as User;
        } catch (error) {
          console.error('🔑 [AUTHORIZE V5] Error:', error);
          return null;
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      console.log('[JWT Callback V5] Called with:', {
        hasUser: !!user,
        trigger,
        tokenBefore: { id: token.id, tenantId: token.tenantId, role: token.role },
      });

      // On first sign in
      if (user) {
        console.log('[JWT Callback V5] User object:', {
          id: user.id,
          email: user.email,
          tenantId: (user as any).tenantId,
          role: (user as any).role,
        });

        token.id = user.id;
        token.tenantId = (user as any).tenantId;
        token.role = (user as any).role;

        console.log('[JWT Callback V5] Token after user:', {
          id: token.id,
          tenantId: token.tenantId,
          role: token.role,
        });
      }

      // Update token if session is updated
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      console.log('[JWT Callback V5] Returning token:', {
        id: token.id,
        tenantId: token.tenantId,
        role: token.role,
        hasAllFields: !!(token.id && token.tenantId && token.role),
      });

      return token;
    },
    async session({ session, token }) {
      console.log('[Session Callback V5] Token received:', {
        id: token.id,
        tenantId: token.tenantId,
        role: token.role,
      });

      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).tenantId = token.tenantId as string;
        (session.user as any).role = token.role as string;
      }

      console.log('[Session Callback V5] Returning session:', {
        userId: session.user?.id,
        tenantId: (session.user as any)?.tenantId,
        role: (session.user as any)?.role,
      });

      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
});

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify password using bcrypt
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
