# 📘 API Route Migration Guide

**Created**: 2026-01-18
**Purpose**: Guide for migrating API routes to use the new route wrapper
**Target**: 68 API routes (2 completed, 66 remaining)

---

## 🎯 MIGRATION OBJECTIVES

### What We're Eliminating

- ❌ **240+ duplicate error handlers** (`try-catch` blocks)
- ❌ **105+ duplicate permission checks** (`requirePermission` calls)
- ❌ **68+ duplicate tenant validations** (`requireTenantId` calls)
- ❌ **Inconsistent error responses**
- ❌ **Manual parameter extraction** from Next.js 15 async params

### What We're Gaining

- ✅ **Automatic error handling** with structured logging
- ✅ **Auto-injected context** (tenantId, user, role, params)
- ✅ **Consistent error responses**
- ✅ **33% code reduction** (average)
- ✅ **Better type safety**

---

## 📊 PROGRESS TRACKER

### ✅ Completed Routes (2/68)

- [x] `/api/contacts` (GET, POST)
- [x] `/api/contacts/[id]` (GET, PATCH, DELETE)

### 🔄 Remaining Routes (66/68)

#### Contacts Module (5 routes)
- [ ] `/api/contacts/[id]/activities`
- [ ] `/api/contacts/[id]/notes`
- [ ] `/api/contacts/[id]/tasks`
- [ ] `/api/contacts/export`
- [ ] `/api/contacts/import`

#### Vehicles Module (4 routes)
- [ ] `/api/vehicles`
- [ ] `/api/vehicles/[id]`
- [ ] `/api/vehicles/[id]/service-records`
- [ ] `/api/vehicles/[id]/service-records/[recordId]`

#### Quotes Module (5 routes)
- [ ] `/api/quotes`
- [ ] `/api/quotes/[id]`
- [ ] `/api/quotes/[id]/convert`
- [ ] `/api/quotes/[id]/send`
- [ ] `/api/quotes/[id]/pdf`

#### Invoices Module (5 routes)
- [ ] `/api/invoices`
- [ ] `/api/invoices/[id]`
- [ ] `/api/invoices/[id]/send`
- [ ] `/api/invoices/[id]/pdf`
- [ ] `/api/invoices/[id]/payments`

#### Tasks Module (4 routes)
- [ ] `/api/tasks`
- [ ] `/api/tasks/[id]`
- [ ] `/api/tasks/[id]/complete`
- [ ] `/api/tasks/[id]/comments`

#### Projects Module (5 routes)
- [ ] `/api/projects`
- [ ] `/api/projects/[id]`
- [ ] `/api/projects/[id]/tasks`
- [ ] `/api/projects/[id]/milestones`
- [ ] `/api/projects/[id]/team`

#### Accounting Module (15 routes)
- [ ] `/api/accounting/bank-accounts`
- [ ] `/api/accounting/bank-accounts/[id]`
- [ ] `/api/accounting/bank-accounts/[id]/transactions`
- [ ] `/api/accounting/bank-accounts/[id]/reconcile`
- [ ] `/api/accounting/expenses`
- [ ] `/api/accounting/expenses/[id]`
- [ ] `/api/accounting/expenses/[id]/approve`
- [ ] `/api/accounting/inventory`
- [ ] `/api/accounting/inventory/[id]`
- [ ] `/api/accounting/tax-documents`
- [ ] `/api/accounting/tax-documents/[id]`
- [ ] `/api/accounting/payroll`
- [ ] `/api/accounting/litigation`
- [ ] `/api/accounting/litigation/[id]`
- [ ] `/api/accounting/reports`

#### Company Module (5 routes)
- [ ] `/api/company`
- [ ] `/api/company/documents`
- [ ] `/api/company/documents/[id]`
- [ ] `/api/company/legal-documents`
- [ ] `/api/company/legal-documents/[id]`

#### Team Module (4 routes)
- [ ] `/api/team`
- [ ] `/api/team/[id]`
- [ ] `/api/team/invite`
- [ ] `/api/team/[id]/permissions`

#### Communications (4 routes)
- [ ] `/api/communications/messages`
- [ ] `/api/communications/messages/[id]`
- [ ] `/api/communications/emails`
- [ ] `/api/communications/emails/[id]`

#### Others (10 routes)
- [ ] `/api/dashboard/stats`
- [ ] `/api/dashboard/recent-activity`
- [ ] `/api/catalog`
- [ ] `/api/catalog/[id]`
- [ ] `/api/planning/events`
- [ ] `/api/planning/events/[id]`
- [ ] `/api/reports/generate`
- [ ] `/api/settings`
- [ ] `/api/ai/assistant`
- [ ] `/api/notifications`

---

## 🛠️ MIGRATION PATTERN

### Step-by-Step Process

#### 1. Update Imports

**Before:**
```typescript
import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/middleware/require-permission';
import { requireTenantId } from '@/lib/tenant';
import { z } from 'zod';
```

**After:**
```typescript
import { NextResponse } from 'next/server';
import { createApiRoute } from '@/lib/api/route-wrapper';
import { ApiErrors } from '@/lib/api/error-handler';
// Remove: requirePermission, requireTenantId
// Keep: validation schemas, z (for .parse())
```

#### 2. Replace Function Signature

**Before:**
```typescript
export async function GET(req: Request) {
  try {
    const permError = await requirePermission('view_contacts');
    if (permError) return permError;

    const tenantId = await requireTenantId();
    // ... rest
  } catch (error) {
    // ... error handling
  }
}
```

**After:**
```typescript
export const GET = createApiRoute('view_contacts', async (req, ctx) => {
  // ctx.tenantId is auto-injected
  // ctx.user, ctx.role also available
  // No try-catch needed
  // ... rest
});
```

#### 3. Replace Tenant ID References

**Before:**
```typescript
const tenantId = await requireTenantId();
const contacts = await prisma.contact.findMany({
  where: { tenant_id: tenantId }
});
```

**After:**
```typescript
const contacts = await prisma.contact.findMany({
  where: { tenant_id: ctx.tenantId } // ✅ Auto-injected
});
```

#### 4. Replace Params Extraction (Dynamic Routes)

**Before:**
```typescript
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // use id
}
```

**After:**
```typescript
export const GET = createApiRoute('view_contacts', async (req, ctx) => {
  const id = ctx.params.id; // ✅ Auto-extracted
});
```

#### 5. Replace Error Handling

**Before:**
```typescript
if (!contact) {
  return NextResponse.json(
    { error: 'Contact non trouvé' },
    { status: 404 }
  );
}
```

**After:**
```typescript
if (!contact) {
  throw ApiErrors.NotFound('Contact'); // ✅ Clean error throwing
}
```

#### 6. Remove Try-Catch Blocks

**Before:**
```typescript
try {
  // logic
} catch (error) {
  console.error('Error:', error);
  return NextResponse.json({ error: 'Error' }, { status: 500 });
}
```

**After:**
```typescript
// Just write logic - errors are auto-caught and handled
```

---

## 📋 COMPLETE BEFORE/AFTER EXAMPLE

### Before: `/api/projects/route.ts` (Typical Pattern)

```typescript
import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/middleware/require-permission';
import { requireTenantId } from '@/lib/tenant';
import { prisma } from '@/lib/prisma';
import { projectSchema } from '@/lib/validations';
import { z } from 'zod';

export async function GET(req: Request) {
  try {
    const permError = await requirePermission('view_projects');
    if (permError) return permError;

    const tenantId = await requireTenantId();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = { tenant_id: tenantId };
    if (status) {
      where.status = status;
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        tasks: { where: { status: { not: 'DONE' } } },
        _count: { select: { tasks: true } }
      }
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des projets' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const permError = await requirePermission('create_projects');
    if (permError) return permError;

    const tenantId = await requireTenantId();
    const body = await req.json();

    const data = projectSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        ...data,
        tenant_id: tenantId,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create project error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du projet' },
      { status: 500 }
    );
  }
}
```

**Lines**: ~80 lines
**Boilerplate**: ~35 lines (44%)

---

### After: `/api/projects/route.ts` (Refactored)

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { projectSchema } from '@/lib/validations';
import { createGetRoute, createPostRoute } from '@/lib/api/route-wrapper';

export const GET = createGetRoute('view_projects', async (req, ctx) => {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const where: any = { tenant_id: ctx.tenantId };
  if (status) {
    where.status = status;
  }

  const projects = await prisma.project.findMany({
    where,
    orderBy: { created_at: 'desc' },
    include: {
      tasks: { where: { status: { not: 'DONE' } } },
      _count: { select: { tasks: true } }
    }
  });

  return NextResponse.json({ projects });
});

export const POST = createPostRoute('create_projects', async (req, ctx) => {
  const body = await req.json();
  const data = projectSchema.parse(body);

  const project = await prisma.project.create({
    data: {
      ...data,
      tenant_id: ctx.tenantId,
    },
  });

  return NextResponse.json(project, { status: 201 });
});
```

**Lines**: ~40 lines
**Boilerplate**: 0 lines
**Reduction**: 50%

---

## 🚀 QUICK MIGRATION CHECKLIST

For each route file:

- [ ] Update imports (add `createApiRoute`, `ApiErrors`)
- [ ] Remove imports (`requirePermission`, `requireTenantId`, unused `z`)
- [ ] Change `export async function` → `export const ... = createApiRoute`
- [ ] Add permission as first parameter
- [ ] Change function params from `(req, { params })` → `(req, ctx)`
- [ ] Remove `try-catch` block
- [ ] Remove `requirePermission` check
- [ ] Remove `requireTenantId` call
- [ ] Replace `tenantId` → `ctx.tenantId`
- [ ] Replace `await params` → `ctx.params`
- [ ] Replace manual error responses with `throw ApiErrors.*`
- [ ] Test the route (auth, permissions, errors)

---

## 🎯 PRIORITY ORDER

### High Priority (Core CRUD - migrate first)
1. **Contacts** (✅ Done)
2. **Vehicles**
3. **Quotes**
4. **Invoices**
5. **Projects**

### Medium Priority (Supporting features)
6. **Tasks**
7. **Accounting** (critical for business)
8. **Company**
9. **Team**

### Low Priority (Can wait)
10. **Communications**
11. **Dashboard**
12. **Reports**
13. **AI Assistant**

---

## ⚠️ SPECIAL CASES

### Case 1: Routes with Multiple Permission Checks

**Before:**
```typescript
const permError = await requireAnyPermission(['view_contacts', 'edit_contacts']);
```

**After:**
```typescript
export const GET = createApiRoute(
  { anyPermission: ['view_contacts', 'edit_contacts'] },
  async (req, ctx) => { /* ... */ }
);
```

### Case 2: Routes Requiring Specific Roles

**Before:**
```typescript
const roleError = await requireRole(['OWNER', 'SUPER_ADMIN']);
```

**After:**
```typescript
export const DELETE = createApiRoute(
  { roles: ['OWNER', 'SUPER_ADMIN'] },
  async (req, ctx) => { /* ... */ }
);
```

### Case 3: Public Routes (No Auth)

**Before:**
```typescript
export async function GET(req: Request) {
  // No auth checks
}
```

**After:**
```typescript
import { createPublicRoute } from '@/lib/api/route-wrapper';

export const GET = createPublicRoute(async (req, ctx) => {
  // ctx.session will be null
});
```

### Case 4: Complex Validation

**Keep Zod validation** - it's auto-handled by the wrapper:

```typescript
export const POST = createPostRoute('create_quote', async (req, ctx) => {
  const body = await req.json();
  const data = quoteSchema.parse(body); // ✅ Throws, auto-caught

  // Continue with validated data
});
```

---

## 🧪 TESTING AFTER MIGRATION

For each migrated route, test:

1. **Authentication**: Unauthenticated requests → 401
2. **Authorization**: Wrong role → 403
3. **Validation**: Invalid data → 422 with Zod details
4. **Tenant Isolation**: Cannot access other tenant's data → 404
5. **Success Case**: Valid request → expected response
6. **Error Case**: Trigger error → 500 with structured log

---

## 📈 EXPECTED RESULTS

### Per-Route Improvements
- **Lines of code**: -30% to -50%
- **Boilerplate**: -100% (eliminated)
- **Error handling**: Consistent across all routes
- **Security**: No accidental missing permission checks

### Project-Wide Improvements
- **Total lines**: ~2400 lines → ~1600 lines (-33%)
- **Error handlers**: 240 duplicates → 1 centralized
- **Permission checks**: 105 duplicates → wrapper-handled
- **Maintainability**: +60% (estimated)

---

## 🤝 COLLABORATION

### If Multiple Developers

1. **Claim a route**: Comment in this file which route you're migrating
2. **Follow the pattern**: Use completed routes as reference
3. **Test thoroughly**: Don't break existing functionality
4. **Commit atomically**: One route per commit
5. **Update progress**: Check off completed routes above

### Git Commit Message Format

```
refactor(api): migrate /api/projects routes to route wrapper

- Removed try-catch boilerplate
- Auto-inject tenantId and permissions
- Use ApiErrors for consistent error responses
- Reduced from 85 to 42 lines (-50%)
```

---

## 📞 QUESTIONS?

If you encounter:
- **Complex permission logic**: Ask for review
- **Unusual patterns**: Document and discuss
- **Breaking tests**: Stop and investigate
- **Type errors**: Check ctx interface in route-wrapper.ts

---

## ✅ COMPLETION CRITERIA

Migration is complete when:
- [ ] All 68 routes use `createApiRoute` wrapper
- [ ] No `requirePermission` imports remain
- [ ] No `requireTenantId` calls remain
- [ ] No manual try-catch blocks for errors
- [ ] All tests pass
- [ ] Manual RBAC testing confirms permissions work

**Estimated Time**: 10-12 hours (progressive migration)
**Recommended Approach**: 5-8 routes per day over 2 weeks

---

**Created by**: Claude Sonnet 4.5
**Date**: 2026-01-18
**Status**: 2/68 routes completed (3%)
**Next**: Continue with Vehicles and Quotes modules
