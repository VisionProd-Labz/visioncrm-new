import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client with multi-tenancy middleware
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Middleware to enforce tenant isolation
 * This middleware automatically adds tenant_id to all queries
 */
export async function setupTenantMiddleware(tenantId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, model, args, query }) {
          // Skip for models without tenant_id (like Tenant itself)
          const modelsWithTenant = [
            'User',
            'Contact',
            'Vehicle',
            'Quote',
            'Invoice',
            'Task',
            'Activity',
            'AIUsage',
            'Webhook',
            'AuditLog',
          ];

          if (!modelsWithTenant.includes(model ?? '')) {
            return query(args);
          }

          // Add tenant_id to where clause for all operations
          if (['findFirst', 'findMany', 'findUnique', 'update', 'delete', 'deleteMany', 'updateMany'].includes(operation)) {
            (args as any).where = { ...(args as any).where, tenant_id: tenantId };
          }

          // Add tenant_id to create operations
          if (operation === 'create') {
            (args as any).data = { ...(args as any).data, tenant_id: tenantId };
          }

          // Add tenant_id to createMany operations
          if (operation === 'createMany' && Array.isArray((args as any).data)) {
            (args as any).data = (args as any).data.map((item: any) => ({ ...item, tenant_id: tenantId }));
          }

          return query(args);
        },
      },
    },
  });
}

export default prisma;
