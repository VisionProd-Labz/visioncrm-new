/**
 * Authentication Validators
 *
 * Extracts validation logic from auth.ts
 * Provides type-safe validation functions
 */

import type { User } from '@prisma/client';

/**
 * Extended user type with tenant relation
 */
export type UserWithTenant = User & {
  tenant?: {
    id: string;
    deleted_at: Date | null;
  } | null;
};

/**
 * Credentials input type
 */
export interface LoginCredentials {
  email?: unknown;
  password?: unknown;
}

/**
 * Validation result type
 */
export interface ValidationResult<T = unknown> {
  isValid: boolean;
  error?: string;
  data?: T;
}

/**
 * Validated credentials type
 */
export interface ValidatedCredentials {
  email: string;
  password: string;
}

/**
 * Validate login credentials
 *
 * Ensures email and password are present and are strings
 *
 * @param credentials - Raw credentials from authorize
 * @returns Validation result with typed credentials
 */
export function validateCredentials(
  credentials: LoginCredentials
): ValidationResult<ValidatedCredentials> {
  if (!credentials?.email || !credentials?.password) {
    return {
      isValid: false,
      error: 'missing_credentials',
    };
  }

  if (
    typeof credentials.email !== 'string' ||
    typeof credentials.password !== 'string'
  ) {
    return {
      isValid: false,
      error: 'invalid_credentials_type',
    };
  }

  return {
    isValid: true,
    data: {
      email: credentials.email,
      password: credentials.password,
    },
  };
}

/**
 * Validate user exists and has password
 *
 * @param user - User from database
 * @returns Validation result
 */
export function validateUserExists(
  user: UserWithTenant | null
): ValidationResult<UserWithTenant> {
  if (!user || !user.password) {
    return {
      isValid: false,
      error: 'user_not_found',
    };
  }

  return {
    isValid: true,
    data: user,
  };
}

/**
 * Validate tenant is active
 *
 * Checks that tenant exists and is not deleted
 *
 * @param user - User with tenant relation
 * @returns Validation result
 */
export function validateTenantActive(
  user: UserWithTenant
): ValidationResult<UserWithTenant> {
  // Check tenant deleted
  if (user.tenant?.deleted_at) {
    return {
      isValid: false,
      error: 'tenant_deleted',
    };
  }

  // Check tenantId exists
  if (!user.tenantId) {
    return {
      isValid: false,
      error: 'missing_tenant_id',
    };
  }

  return {
    isValid: true,
    data: user,
  };
}

/**
 * Validate all user requirements for authentication
 *
 * Combines all validation checks
 *
 * @param user - User from database
 * @returns Validation result
 */
export function validateUserForAuth(
  user: UserWithTenant | null
): ValidationResult<UserWithTenant> {
  // Check user exists
  const userValidation = validateUserExists(user);
  if (!userValidation.isValid) {
    return userValidation;
  }

  // Check tenant active
  const tenantValidation = validateTenantActive(userValidation.data!);
  if (!tenantValidation.isValid) {
    return tenantValidation;
  }

  return {
    isValid: true,
    data: user as UserWithTenant,
  };
}

/**
 * Create sanitized user object for JWT
 *
 * Removes sensitive fields (password, etc.)
 *
 * @param user - Full user object from database
 * @returns Sanitized user object safe for JWT
 */
export function createAuthUserObject(user: UserWithTenant) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    tenantId: user.tenantId!,
    role: user.role,
  };
}

/**
 * Validate JWT token has required fields
 *
 * @param token - JWT token object
 * @returns true if valid
 */
export function isValidToken(token: unknown): boolean {
  if (!token || typeof token !== 'object') return false;

  const t = token as Record<string, unknown>;
  return !!(t.id && t.tenantId && t.role);
}

/**
 * Validate email format
 *
 * Basic email validation (for additional safety)
 *
 * @param email - Email string
 * @returns true if valid format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 *
 * For registration or password change
 *
 * @param password - Password string
 * @returns Validation result with error message
 */
export function validatePasswordStrength(
  password: string
): ValidationResult<string> {
  if (password.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters',
    };
  }

  // Check for at least one number or special character
  if (!/[0-9!@#$%^&*]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one number or special character',
    };
  }

  return {
    isValid: true,
    data: password,
  };
}
