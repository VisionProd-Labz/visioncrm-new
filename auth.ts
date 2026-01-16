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
        // ✅ SECURITY FIX #4: Remove sensitive logs in production
        if (process.env.NODE_ENV === 'development') {
          console.log('🔑 [AUTHORIZE] Login attempt');
        }

        if (!credentials?.email || !credentials?.password) {
          if (process.env.NODE_ENV === 'development') {
            console.log('🔑 [AUTHORIZE] Missing credentials');
          }
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          const user = await prisma.user.findUnique({
            where: { email },
            include: { tenant: true },
          });

          // ✅ SECURITY: Never reveal if user exists or not
          if (!user || !user.password) {
            if (process.env.NODE_ENV === 'development') {
              console.log('🔑 [AUTHORIZE] Authentication failed: user not found or no password');
            }
            return null;
          }

          const isPasswordValid = await bcrypt.compare(password, user.password);

          // ✅ SECURITY: Never log password validation result
          if (!isPasswordValid) {
            if (process.env.NODE_ENV === 'development') {
              console.log('🔑 [AUTHORIZE] Authentication failed: invalid password');
            }
            return null;
          }

          // Check if tenant is active
          if (user.tenant?.deleted_at) {
            if (process.env.NODE_ENV === 'development') {
              console.log('🔑 [AUTHORIZE] Authentication failed: tenant deleted');
            }
            return null;
          }

          if (!user.tenantId) {
            if (process.env.NODE_ENV === 'development') {
              console.log('🔑 [AUTHORIZE] Authentication failed: no tenantId');
            }
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

          // ✅ SECURITY: Only log in development, without email
          if (process.env.NODE_ENV === 'development') {
            console.log('🔑 [AUTHORIZE] Authentication successful:', {
              userId: userObject.id,
              tenantId: userObject.tenantId,
              role: userObject.role,
            });
          }

          return userObject as User;
        } catch (error) {
          // ✅ SECURITY: Never log detailed error in production
          if (process.env.NODE_ENV === 'development') {
            console.error('🔑 [AUTHORIZE] Error:', error);
          } else {
            console.error('🔑 [AUTHORIZE] Authentication error');
          }
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
      // ✅ SECURITY: Only log in development, without email
      if (process.env.NODE_ENV === 'development') {
        console.log('[JWT Callback] Called with:', {
          hasUser: !!user,
          trigger,
          hasToken: !!(token.id && token.tenantId),
        });
      }

      // On first sign in
      if (user) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[JWT Callback] Setting token from user:', {
            userId: user.id,
            tenantId: (user as any).tenantId,
            role: (user as any).role,
          });
        }

        token.id = user.id;
        token.tenantId = (user as any).tenantId;
        token.role = (user as any).role;
      }

      // Update token if session is updated
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      // ✅ SECURITY: Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[Session Callback] Creating session from token:', {
          hasToken: !!(token.id && token.tenantId),
        });
      }

      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).tenantId = token.tenantId as string;
        (session.user as any).role = token.role as string;
      }

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
