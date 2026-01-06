import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import LinkedInProvider from 'next-auth/providers/linkedin';
import TwitterProvider from 'next-auth/providers/twitter';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { checkRateLimit } from './rate-limit';

/**
 * NextAuth configuration
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email et mot de passe requis');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { tenant: true },
        });

        if (!user || !user.password) {
          throw new Error('Identifiants invalides');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Identifiants invalides');
        }

        // Check if tenant is active
        if (user.tenant?.deleted_at) {
          throw new Error('Ce compte a été désactivé');
        }

        if (!user.tenantId) {
          throw new Error('Tenant manquant');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          tenantId: user.tenantId,
          role: user.role,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID || '',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'openid profile email',
        },
      },
      issuer: 'https://www.linkedin.com',
      jwks_endpoint: 'https://www.linkedin.com/oauth/openid/jwks',
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          tenantId: '', // Set during sign-in callback
          role: 'USER' as any,
        } as any;
      },
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
      version: '2.0',
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session, account }) {
      // On first sign in, get user from database with tenant info
      if (user && account) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { tenant: true },
        });

        if (dbUser) {
          // If OAuth user doesn't have a tenant, create one NOW
          if (!dbUser.tenantId && account.provider !== 'credentials') {
            // Generate subdomain from name or email
            const subdomain = (dbUser.name || dbUser.email.split('@')[0])
              .toLowerCase()
              .replace(/[^a-z0-9-]/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '')
              .substring(0, 63);

            const tenant = await prisma.tenant.create({
              data: {
                name: dbUser.name || dbUser.email.split('@')[0],
                company_name: dbUser.name || dbUser.email.split('@')[0],
                subdomain,
                plan: 'FREE',
              },
            });

            await prisma.user.update({
              where: { id: dbUser.id },
              data: {
                tenantId: tenant.id,
                role: 'OWNER',
              },
            });

            token.id = dbUser.id;
            token.tenantId = tenant.id;
            token.role = 'OWNER';
          } else {
            token.id = dbUser.id;
            token.tenantId = dbUser.tenantId || '';
            token.role = dbUser.role;
          }
        }
      }

      if (user && !account) {
        // Credentials login
        token.id = user.id;
        token.tenantId = user.tenantId;
        token.role = user.role;
      }

      // Update token if session is updated
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.tenantId = token.tenantId as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

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
