import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import { prisma } from './lib/prisma';
import bcrypt from 'bcryptjs';
import type { User } from 'next-auth';
import {
  validateCredentials,
  validateUserForAuth,
  createAuthUserObject,
} from './lib/auth/validators';
import {
  logAuthorizeAttempt,
  logAuthorizeSuccess,
  logAuthorizeFailed,
  logAuthError,
  logJwtCallback,
  logSessionCallback,
} from './lib/auth/logger';

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
        logAuthorizeAttempt();

        // Validate credentials
        const credentialsValidation = validateCredentials(credentials);
        if (!credentialsValidation.isValid) {
          logAuthorizeFailed('missing_credentials');
          return null;
        }

        const { email, password } = credentialsValidation.data!;

        try {
          // Fetch user with tenant
          const user = await prisma.user.findUnique({
            where: { email },
            include: { tenant: true },
          });

          // Validate user and tenant
          const userValidation = validateUserForAuth(user);
          if (!userValidation.isValid) {
            logAuthorizeFailed(userValidation.error as any);
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(password, user!.password!);
          if (!isPasswordValid) {
            logAuthorizeFailed('invalid_password');
            return null;
          }

          // Create sanitized user object
          const userObject = createAuthUserObject(user!);

          logAuthorizeSuccess({
            userId: userObject.id,
            tenantId: userObject.tenantId,
            role: userObject.role,
          });

          return userObject as User;
        } catch (error) {
          logAuthError(error);
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
      logJwtCallback({
        hasUser: !!user,
        trigger,
        hasToken: !!(token.id && token.tenantId),
      });

      // On first sign in
      if (user) {
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
      logSessionCallback({
        hasToken: !!(token.id && token.tenantId),
      });

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
