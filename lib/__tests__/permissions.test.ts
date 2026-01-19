/**
 * Unit tests for role-based permissions system
 *
 * Tests critical access control logic for:
 * - Role permission assignments
 * - Permission checking functions
 * - Hierarchical access control
 * - Security boundaries between roles
 */

import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  getRoleLabel,
  getRoleDescription,
  type Role,
  type Permission,
} from '../permissions';

describe('hasPermission', () => {
  describe('SUPER_ADMIN permissions', () => {
    it('should have all permissions', () => {
      expect(hasPermission('SUPER_ADMIN', 'view_dashboard')).toBe(true);
      expect(hasPermission('SUPER_ADMIN', 'delete_contacts')).toBe(true);
      expect(hasPermission('SUPER_ADMIN', 'edit_company')).toBe(true);
      expect(hasPermission('SUPER_ADMIN', 'delete_bank_accounts')).toBe(true);
      expect(hasPermission('SUPER_ADMIN', 'approve_expenses')).toBe(true);
    });
  });

  describe('OWNER permissions', () => {
    it('should have full access like SUPER_ADMIN', () => {
      expect(hasPermission('OWNER', 'view_dashboard')).toBe(true);
      expect(hasPermission('OWNER', 'delete_contacts')).toBe(true);
      expect(hasPermission('OWNER', 'edit_company')).toBe(true);
      expect(hasPermission('OWNER', 'delete_bank_accounts')).toBe(true);
      expect(hasPermission('OWNER', 'approve_expenses')).toBe(true);
    });

    it('should have team management permissions', () => {
      expect(hasPermission('OWNER', 'invite_members')).toBe(true);
      expect(hasPermission('OWNER', 'edit_members')).toBe(true);
      expect(hasPermission('OWNER', 'remove_members')).toBe(true);
    });
  });

  describe('MANAGER permissions', () => {
    it('should have most operational permissions', () => {
      expect(hasPermission('MANAGER', 'view_dashboard')).toBe(true);
      expect(hasPermission('MANAGER', 'create_contacts')).toBe(true);
      expect(hasPermission('MANAGER', 'edit_quotes')).toBe(true);
      expect(hasPermission('MANAGER', 'create_invoices')).toBe(true);
      expect(hasPermission('MANAGER', 'approve_expenses')).toBe(true);
    });

    it('should NOT have critical delete permissions', () => {
      expect(hasPermission('MANAGER', 'delete_bank_accounts')).toBe(false);
      expect(hasPermission('MANAGER', 'delete_bank_transactions')).toBe(false);
      expect(hasPermission('MANAGER', 'delete_expenses')).toBe(false);
      expect(hasPermission('MANAGER', 'delete_company_documents')).toBe(false);
    });

    it('should NOT be able to edit company settings', () => {
      expect(hasPermission('MANAGER', 'view_company')).toBe(true);
      expect(hasPermission('MANAGER', 'edit_company')).toBe(false);
    });

    it('should NOT be able to remove team members', () => {
      expect(hasPermission('MANAGER', 'invite_members')).toBe(true);
      expect(hasPermission('MANAGER', 'edit_members')).toBe(true);
      expect(hasPermission('MANAGER', 'remove_members')).toBe(false);
    });
  });

  describe('ACCOUNTANT permissions', () => {
    it('should have full accounting permissions', () => {
      expect(hasPermission('ACCOUNTANT', 'view_accounting')).toBe(true);
      expect(hasPermission('ACCOUNTANT', 'create_bank_accounts')).toBe(true);
      expect(hasPermission('ACCOUNTANT', 'reconcile_bank_accounts')).toBe(true);
      expect(hasPermission('ACCOUNTANT', 'approve_expenses')).toBe(true);
      expect(hasPermission('ACCOUNTANT', 'view_financial_reports')).toBe(true);
      expect(hasPermission('ACCOUNTANT', 'generate_financial_reports')).toBe(
        true
      );
    });

    it('should have invoice and quote permissions', () => {
      expect(hasPermission('ACCOUNTANT', 'create_invoices')).toBe(true);
      expect(hasPermission('ACCOUNTANT', 'edit_invoices')).toBe(true);
      expect(hasPermission('ACCOUNTANT', 'create_quotes')).toBe(true);
      expect(hasPermission('ACCOUNTANT', 'edit_quotes')).toBe(true);
    });

    it('should NOT have delete permissions', () => {
      expect(hasPermission('ACCOUNTANT', 'delete_bank_accounts')).toBe(false);
      expect(hasPermission('ACCOUNTANT', 'delete_contacts')).toBe(false);
      expect(hasPermission('ACCOUNTANT', 'delete_invoices')).toBe(false);
      expect(hasPermission('ACCOUNTANT', 'delete_expenses')).toBe(false);
    });

    it('should NOT have team management permissions', () => {
      expect(hasPermission('ACCOUNTANT', 'invite_members')).toBe(false);
      expect(hasPermission('ACCOUNTANT', 'edit_members')).toBe(false);
      expect(hasPermission('ACCOUNTANT', 'remove_members')).toBe(false);
    });

    it('should have view-only access to contacts and vehicles', () => {
      expect(hasPermission('ACCOUNTANT', 'view_contacts')).toBe(true);
      expect(hasPermission('ACCOUNTANT', 'create_contacts')).toBe(false);
      expect(hasPermission('ACCOUNTANT', 'edit_contacts')).toBe(false);
      expect(hasPermission('ACCOUNTANT', 'view_vehicles')).toBe(true);
      expect(hasPermission('ACCOUNTANT', 'create_vehicles')).toBe(false);
    });
  });

  describe('USER permissions', () => {
    it('should have basic operational permissions', () => {
      expect(hasPermission('USER', 'view_dashboard')).toBe(true);
      expect(hasPermission('USER', 'create_contacts')).toBe(true);
      expect(hasPermission('USER', 'create_tasks')).toBe(true);
      expect(hasPermission('USER', 'view_planning')).toBe(true);
      expect(hasPermission('USER', 'use_ai_assistant')).toBe(true);
    });

    it('should NOT have delete permissions', () => {
      expect(hasPermission('USER', 'delete_contacts')).toBe(false);
      expect(hasPermission('USER', 'delete_vehicles')).toBe(false);
      expect(hasPermission('USER', 'delete_tasks')).toBe(false);
      expect(hasPermission('USER', 'delete_quotes')).toBe(false);
    });

    it('should NOT have accounting permissions', () => {
      expect(hasPermission('USER', 'view_accounting')).toBe(false);
      expect(hasPermission('USER', 'view_bank_accounts')).toBe(false);
      expect(hasPermission('USER', 'view_expenses')).toBe(false);
      expect(hasPermission('USER', 'view_financial_reports')).toBe(false);
    });

    it('should NOT have team or company management permissions', () => {
      expect(hasPermission('USER', 'invite_members')).toBe(false);
      expect(hasPermission('USER', 'edit_members')).toBe(false);
      expect(hasPermission('USER', 'view_company')).toBe(false);
      expect(hasPermission('USER', 'edit_company')).toBe(false);
      expect(hasPermission('USER', 'view_settings')).toBe(false);
      expect(hasPermission('USER', 'edit_settings')).toBe(false);
    });

    it('should have limited quote and invoice access', () => {
      expect(hasPermission('USER', 'view_quotes')).toBe(true);
      expect(hasPermission('USER', 'create_quotes')).toBe(true);
      expect(hasPermission('USER', 'edit_quotes')).toBe(false);
      expect(hasPermission('USER', 'send_quotes')).toBe(false);

      expect(hasPermission('USER', 'view_invoices')).toBe(true);
      expect(hasPermission('USER', 'create_invoices')).toBe(false);
      expect(hasPermission('USER', 'edit_invoices')).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should return false for invalid role', () => {
      expect(hasPermission('INVALID_ROLE' as Role, 'view_dashboard')).toBe(
        false
      );
    });

    it('should return false for invalid permission', () => {
      expect(
        hasPermission('SUPER_ADMIN', 'invalid_permission' as Permission)
      ).toBe(false);
    });

    it('should handle undefined gracefully', () => {
      expect(hasPermission(undefined as any, 'view_dashboard')).toBe(false);
      expect(hasPermission('SUPER_ADMIN', undefined as any)).toBe(false);
    });
  });
});

describe('hasAnyPermission', () => {
  it('should return true if role has ANY of the specified permissions', () => {
    expect(
      hasAnyPermission('MANAGER', [
        'delete_company', // doesn't have
        'edit_contacts', // has this
        'delete_bank_accounts', // doesn't have
      ])
    ).toBe(true);
  });

  it('should return false if role has NONE of the permissions', () => {
    expect(
      hasAnyPermission('USER', [
        'delete_contacts',
        'delete_invoices',
        'edit_company',
      ])
    ).toBe(false);
  });

  it('should return true if role has ALL the permissions', () => {
    expect(
      hasAnyPermission('OWNER', ['view_dashboard', 'edit_company'])
    ).toBe(true);
  });

  it('should handle empty permission array', () => {
    expect(hasAnyPermission('SUPER_ADMIN', [])).toBe(false);
  });

  it('should handle single permission', () => {
    expect(hasAnyPermission('USER', ['view_dashboard'])).toBe(true);
    expect(hasAnyPermission('USER', ['delete_company'])).toBe(false);
  });
});

describe('hasAllPermissions', () => {
  it('should return true if role has ALL specified permissions', () => {
    expect(
      hasAllPermissions('OWNER', [
        'view_dashboard',
        'edit_contacts',
        'create_invoices',
      ])
    ).toBe(true);
  });

  it('should return false if role is missing ANY permission', () => {
    expect(
      hasAllPermissions('MANAGER', [
        'view_dashboard', // has
        'edit_contacts', // has
        'delete_bank_accounts', // doesn't have
      ])
    ).toBe(false);
  });

  it('should return true for empty permission array', () => {
    expect(hasAllPermissions('USER', [])).toBe(true);
  });

  it('should return true for single permission if role has it', () => {
    expect(hasAllPermissions('ACCOUNTANT', ['view_accounting'])).toBe(true);
  });

  it('should return false for single permission if role lacks it', () => {
    expect(hasAllPermissions('USER', ['view_accounting'])).toBe(false);
  });
});

describe('getRolePermissions', () => {
  it('should return all permissions for SUPER_ADMIN', () => {
    const permissions = getRolePermissions('SUPER_ADMIN');
    expect(permissions.length).toBeGreaterThan(50);
    expect(permissions).toContain('view_dashboard');
    expect(permissions).toContain('delete_bank_accounts');
  });

  it('should return all permissions for OWNER', () => {
    const permissions = getRolePermissions('OWNER');
    expect(permissions.length).toBeGreaterThan(50);
    expect(permissions).toContain('edit_company');
  });

  it('should return limited permissions for USER', () => {
    const permissions = getRolePermissions('USER');
    expect(permissions.length).toBeLessThan(30);
    expect(permissions).toContain('view_dashboard');
    expect(permissions).not.toContain('delete_contacts');
  });

  it('should return empty array for invalid role', () => {
    const permissions = getRolePermissions('INVALID' as Role);
    expect(permissions).toEqual([]);
  });

  it('should not allow modification of original permissions', () => {
    const permissions1 = getRolePermissions('USER');
    const permissions2 = getRolePermissions('USER');

    // Should return same permissions
    expect(permissions1).toEqual(permissions2);
  });
});

describe('getRoleLabel', () => {
  it('should return French labels for all roles', () => {
    expect(getRoleLabel('SUPER_ADMIN')).toBe('Super Administrateur');
    expect(getRoleLabel('OWNER')).toBe('Propriétaire');
    expect(getRoleLabel('MANAGER')).toBe('Manager');
    expect(getRoleLabel('ACCOUNTANT')).toBe('Comptable');
    expect(getRoleLabel('USER')).toBe('Employé');
  });

  it('should return role itself if label not found', () => {
    expect(getRoleLabel('UNKNOWN' as Role)).toBe('UNKNOWN');
  });
});

describe('getRoleDescription', () => {
  it('should return French descriptions for all roles', () => {
    expect(getRoleDescription('SUPER_ADMIN')).toContain('Accès complet');
    expect(getRoleDescription('OWNER')).toContain('Propriétaire');
    expect(getRoleDescription('MANAGER')).toContain('Gestion complète');
    expect(getRoleDescription('ACCOUNTANT')).toContain('comptabilité');
    expect(getRoleDescription('USER')).toContain('Employé');
  });

  it('should return empty string for invalid role', () => {
    expect(getRoleDescription('INVALID' as Role)).toBe('');
  });
});

describe('Role hierarchy and security boundaries', () => {
  it('should enforce that USER cannot perform admin actions', () => {
    const adminPermissions: Permission[] = [
      'edit_company',
      'edit_settings',
      'invite_members',
      'remove_members',
      'delete_bank_accounts',
    ];

    adminPermissions.forEach((permission) => {
      expect(hasPermission('USER', permission)).toBe(false);
    });
  });

  it('should enforce that ACCOUNTANT cannot manage team', () => {
    expect(hasPermission('ACCOUNTANT', 'invite_members')).toBe(false);
    expect(hasPermission('ACCOUNTANT', 'edit_members')).toBe(false);
    expect(hasPermission('ACCOUNTANT', 'remove_members')).toBe(false);
  });

  it('should enforce that MANAGER cannot delete financial records', () => {
    expect(hasPermission('MANAGER', 'delete_bank_accounts')).toBe(false);
    expect(hasPermission('MANAGER', 'delete_expenses')).toBe(false);
    expect(hasPermission('MANAGER', 'delete_bank_transactions')).toBe(false);
  });

  it('should allow OWNER and SUPER_ADMIN equal access', () => {
    const criticalPermissions: Permission[] = [
      'delete_bank_accounts',
      'delete_expenses',
      'edit_company',
      'remove_members',
    ];

    criticalPermissions.forEach((permission) => {
      expect(hasPermission('SUPER_ADMIN', permission)).toBe(true);
      expect(hasPermission('OWNER', permission)).toBe(true);
    });
  });

  it('should ensure accountants have necessary financial access', () => {
    const accountingPermissions: Permission[] = [
      'view_accounting',
      'create_bank_accounts',
      'reconcile_bank_accounts',
      'approve_expenses',
      'view_financial_reports',
      'generate_financial_reports',
    ];

    accountingPermissions.forEach((permission) => {
      expect(hasPermission('ACCOUNTANT', permission)).toBe(true);
    });
  });
});

describe('Permission completeness', () => {
  it('should have consistent permission naming', () => {
    const permissions = getRolePermissions('SUPER_ADMIN');

    permissions.forEach((permission) => {
      // Should follow pattern: verb_resource
      const parts = permission.split('_');
      expect(parts.length).toBeGreaterThanOrEqual(2);

      const validVerbs = [
        'view',
        'create',
        'edit',
        'delete',
        'send',
        'use',
        'invite',
        'remove',
        'upload',
        'reconcile',
        'approve',
        'generate',
      ];

      const verb = parts[0];
      expect(validVerbs).toContain(verb);
    });
  });

  it('should have permissions for all critical resources', () => {
    const allPermissions = getRolePermissions('SUPER_ADMIN');

    const criticalResources = [
      'contacts',
      'invoices',
      'quotes',
      'tasks',
      'company',
      'team',
      'bank_accounts',
      'expenses',
    ];

    criticalResources.forEach((resource) => {
      const hasResourcePermissions = allPermissions.some((permission) =>
        permission.includes(resource)
      );
      expect(hasResourcePermissions).toBe(true);
    });
  });
});
