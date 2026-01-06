import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth';

describe('Auth utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123!';
      const hashed = await hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed).toMatch(/^\$2[aby]\$.{56}$/); // bcrypt format
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'TestPassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Different salts
    });

    it('should handle empty password', async () => {
      const hash = await hashPassword('');
      expect(hash).toBeDefined();
    });

    it('should handle special characters', async () => {
      const password = 'P@$$w0rd!#$%^&*()';
      const hash = await hashPassword(password);
      expect(hash).toBeDefined();
    });

    it('should handle very long passwords', async () => {
      const password = 'a'.repeat(100);
      const hash = await hashPassword(password);
      expect(hash).toBeDefined();
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword456!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it('should reject empty password when hash is not empty', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('', hash);

      expect(isValid).toBe(false);
    });

    it('should be case-sensitive', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('testpassword123!', hash);

      expect(isValid).toBe(false);
    });

    it('should handle unicode characters', async () => {
      const password = 'Tëst🔐Pässwörd';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });
  });

  describe('Password security', () => {
    it('should take reasonable time to hash (anti-DoS)', async () => {
      const password = 'TestPassword123!';
      const start = Date.now();
      await hashPassword(password);
      const duration = Date.now() - start;

      // Should complete within 1 second (bcrypt with reasonable rounds)
      expect(duration).toBeLessThan(1000);
    });

    it('should not leak timing information (constant-time comparison)', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      const start1 = Date.now();
      await verifyPassword('a', hash);
      const duration1 = Date.now() - start1;

      const start2 = Date.now();
      await verifyPassword('TestPassword123', hash); // Close but wrong
      const duration2 = Date.now() - start2;

      // Timing should be similar (within 50ms) for security
      expect(Math.abs(duration1 - duration2)).toBeLessThan(50);
    });
  });
});
