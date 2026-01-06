import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

// Mock Upstash Redis
vi.mock('@upstash/redis', () => ({
  Redis: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    set: vi.fn(),
    incr: vi.fn(),
    expire: vi.fn(),
  })),
}));

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: vi.fn().mockImplementation(() => ({
    limit: vi.fn().mockResolvedValue({
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60000,
      pending: Promise.resolve(),
    }),
  })),
}));

describe('Rate Limiting', () => {
  describe('getClientIp', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = new Request('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
      });

      const ip = getClientIp(request);
      expect(ip).toBe('192.168.1.1');
    });

    it('should extract IP from x-real-ip header', () => {
      const request = new Request('http://localhost:3000', {
        headers: {
          'x-real-ip': '192.168.1.2',
        },
      });

      const ip = getClientIp(request);
      expect(ip).toBe('192.168.1.2');
    });

    it('should prefer x-forwarded-for over x-real-ip', () => {
      const request = new Request('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'x-real-ip': '192.168.1.2',
        },
      });

      const ip = getClientIp(request);
      expect(ip).toBe('192.168.1.1');
    });

    it('should handle multiple IPs in x-forwarded-for', () => {
      const request = new Request('http://localhost:3000', {
        headers: {
          'x-forwarded-for': '  192.168.1.1  ,  10.0.0.1  ,  172.16.0.1  ',
        },
      });

      const ip = getClientIp(request);
      expect(ip).toBe('192.168.1.1'); // First IP, trimmed
    });

    it('should generate dev IP when no headers present', () => {
      const request = new Request('http://localhost:3000');

      const ip = getClientIp(request);
      expect(ip).toMatch(/^dev-[a-z0-9]+$/);
    });

    it('should generate different dev IPs for different requests', () => {
      const request1 = new Request('http://localhost:3000');
      const request2 = new Request('http://localhost:3000');

      const ip1 = getClientIp(request1);
      const ip2 = getClientIp(request2);

      expect(ip1).not.toBe(ip2);
      expect(ip1).toMatch(/^dev-/);
      expect(ip2).toMatch(/^dev-/);
    });
  });

  describe('checkRateLimit', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should return success when rate limit not exceeded', async () => {
      const result = await checkRateLimit('192.168.1.1', 'api_general');

      expect(result.allowed).toBe(true);
      expect(result.resetAt).toBeInstanceOf(Date);
    });

    it('should handle different rate limit types', async () => {
      const types = ['ai_chat', 'login', 'register', 'password_reset', 'api_general'] as const;

      for (const type of types) {
        const result = await checkRateLimit('192.168.1.1', type);
        expect(result.allowed).toBe(true);
      }
    });

    it('should include reset timestamp', async () => {
      const result = await checkRateLimit('192.168.1.1', 'login');

      expect(result.resetAt).toBeInstanceOf(Date);
      expect(result.resetAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should work with different IP addresses', async () => {
      const ips = ['192.168.1.1', '10.0.0.1', '172.16.0.1', 'dev-test123'];

      for (const ip of ips) {
        const result = await checkRateLimit(ip, 'api_general');
        expect(result.allowed).toBe(true);
      }
    });
  });
});
