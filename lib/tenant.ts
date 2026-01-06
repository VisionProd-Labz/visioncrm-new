import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { prisma } from './prisma';

/**
 * Get current tenant ID from session
 */
export async function getCurrentTenantId(): Promise<string> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.tenantId) {
    throw new Error('Unauthorized: No tenant context');
  }

  return session.user.tenantId;
}

/**
 * Get current tenant from session
 */
export async function getCurrentTenant() {
  const tenantId = await getCurrentTenantId();

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  return tenant;
}

/**
 * Get current user from session
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error('Unauthorized: No user context');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { tenant: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

/**
 * Check if user has permission based on role
 */
export function hasPermission(
  userRole: 'SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'USER',
  requiredRole: 'SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'USER'
): boolean {
  const roleHierarchy = {
    SUPER_ADMIN: 4,
    OWNER: 3,
    MANAGER: 2,
    USER: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Extract subdomain from request
 */
export function getSubdomainFromHost(host: string): string | null {
  // Remove port if present
  const hostname = host.split(':')[0];

  // localhost or IP address
  if (hostname === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return null;
  }

  // Extract subdomain
  const parts = hostname.split('.');

  // Need at least subdomain.domain.tld
  if (parts.length < 3) {
    return null;
  }

  // Return first part as subdomain
  return parts[0];
}

/**
 * Get tenant by subdomain
 */
export async function getTenantBySubdomain(subdomain: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain },
  });

  return tenant;
}
