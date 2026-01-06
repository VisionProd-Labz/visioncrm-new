/**
 * Role-based permissions system
 */

export type Role = 'SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'ACCOUNTANT' | 'USER';

export type Permission =
  // Dashboard
  | 'view_dashboard'

  // Contacts
  | 'view_contacts'
  | 'create_contacts'
  | 'edit_contacts'
  | 'delete_contacts'

  // Vehicles
  | 'view_vehicles'
  | 'create_vehicles'
  | 'edit_vehicles'
  | 'delete_vehicles'

  // Quotes
  | 'view_quotes'
  | 'create_quotes'
  | 'edit_quotes'
  | 'delete_quotes'
  | 'send_quotes'

  // Invoices
  | 'view_invoices'
  | 'create_invoices'
  | 'edit_invoices'
  | 'delete_invoices'
  | 'send_invoices'

  // Tasks
  | 'view_tasks'
  | 'create_tasks'
  | 'edit_tasks'
  | 'delete_tasks'

  // Catalog
  | 'view_catalog'
  | 'edit_catalog'

  // Planning
  | 'view_planning'
  | 'edit_planning'

  // Communications
  | 'view_communications'
  | 'send_messages'

  // Email
  | 'view_emails'
  | 'send_emails'

  // AI Assistant
  | 'use_ai_assistant'

  // Reports
  | 'view_reports'

  // Team Management
  | 'view_team'
  | 'invite_members'
  | 'edit_members'
  | 'remove_members'

  // Company Settings
  | 'view_company'
  | 'edit_company'

  // Settings
  | 'view_settings'
  | 'edit_settings';

/**
 * Permission matrix: defines which permissions each role has
 */
export const rolePermissions: Record<Role, Permission[]> = {
  SUPER_ADMIN: [
    // All permissions
    'view_dashboard',
    'view_contacts', 'create_contacts', 'edit_contacts', 'delete_contacts',
    'view_vehicles', 'create_vehicles', 'edit_vehicles', 'delete_vehicles',
    'view_quotes', 'create_quotes', 'edit_quotes', 'delete_quotes', 'send_quotes',
    'view_invoices', 'create_invoices', 'edit_invoices', 'delete_invoices', 'send_invoices',
    'view_tasks', 'create_tasks', 'edit_tasks', 'delete_tasks',
    'view_catalog', 'edit_catalog',
    'view_planning', 'edit_planning',
    'view_communications', 'send_messages',
    'view_emails', 'send_emails',
    'use_ai_assistant',
    'view_reports',
    'view_team', 'invite_members', 'edit_members', 'remove_members',
    'view_company', 'edit_company',
    'view_settings', 'edit_settings',
  ],

  OWNER: [
    // Full access except super admin features
    'view_dashboard',
    'view_contacts', 'create_contacts', 'edit_contacts', 'delete_contacts',
    'view_vehicles', 'create_vehicles', 'edit_vehicles', 'delete_vehicles',
    'view_quotes', 'create_quotes', 'edit_quotes', 'delete_quotes', 'send_quotes',
    'view_invoices', 'create_invoices', 'edit_invoices', 'delete_invoices', 'send_invoices',
    'view_tasks', 'create_tasks', 'edit_tasks', 'delete_tasks',
    'view_catalog', 'edit_catalog',
    'view_planning', 'edit_planning',
    'view_communications', 'send_messages',
    'view_emails', 'send_emails',
    'use_ai_assistant',
    'view_reports',
    'view_team', 'invite_members', 'edit_members', 'remove_members',
    'view_company', 'edit_company',
    'view_settings', 'edit_settings',
  ],

  MANAGER: [
    // Most permissions except critical business settings
    'view_dashboard',
    'view_contacts', 'create_contacts', 'edit_contacts', 'delete_contacts',
    'view_vehicles', 'create_vehicles', 'edit_vehicles', 'delete_vehicles',
    'view_quotes', 'create_quotes', 'edit_quotes', 'delete_quotes', 'send_quotes',
    'view_invoices', 'create_invoices', 'edit_invoices', 'delete_invoices', 'send_invoices',
    'view_tasks', 'create_tasks', 'edit_tasks', 'delete_tasks',
    'view_catalog', 'edit_catalog',
    'view_planning', 'edit_planning',
    'view_communications', 'send_messages',
    'view_emails', 'send_emails',
    'use_ai_assistant',
    'view_reports',
    'view_team', 'invite_members', 'edit_members', // Cannot remove members
    'view_company', // Cannot edit company settings
    'view_settings',
  ],

  ACCOUNTANT: [
    // Only accounting-related permissions
    'view_dashboard',
    'view_contacts', // View only for reference
    'view_vehicles', // View only for reference
    'view_quotes', 'create_quotes', 'edit_quotes', 'send_quotes',
    'view_invoices', 'create_invoices', 'edit_invoices', 'send_invoices',
    'view_catalog', // View only for pricing reference
    'view_reports',
    'view_company', // View only for invoicing data
  ],

  USER: [
    // Basic employee permissions
    'view_dashboard',
    'view_contacts', 'create_contacts', 'edit_contacts',
    'view_vehicles', 'create_vehicles', 'edit_vehicles',
    'view_quotes', 'create_quotes',
    'view_invoices',
    'view_tasks', 'create_tasks', 'edit_tasks',
    'view_catalog',
    'view_planning', 'edit_planning',
    'view_communications', 'send_messages',
    'view_emails', 'send_emails',
    'use_ai_assistant',
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return rolePermissions[role] ?? [];
}

/**
 * Get role label for display
 */
export function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    SUPER_ADMIN: 'Super Administrateur',
    OWNER: 'Propriétaire',
    MANAGER: 'Manager',
    ACCOUNTANT: 'Comptable',
    USER: 'Employé',
  };
  return labels[role] ?? role;
}

/**
 * Get role description
 */
export function getRoleDescription(role: Role): string {
  const descriptions: Record<Role, string> = {
    SUPER_ADMIN: 'Accès complet à toutes les fonctionnalités',
    OWNER: 'Propriétaire de l\'entreprise avec accès complet',
    MANAGER: 'Gestion complète sauf paramètres critiques',
    ACCOUNTANT: 'Accès uniquement aux devis, factures et rapports comptables',
    USER: 'Employé avec accès aux fonctionnalités de base',
  };
  return descriptions[role] ?? '';
}
