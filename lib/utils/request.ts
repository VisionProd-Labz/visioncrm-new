/**
 * HTTP Request Utilities
 *
 * Centralizes request handling logic
 * - IP extraction
 * - User agent parsing
 * - Header utilities
 */

/**
 * Get client IP address from request headers
 *
 * Handles proxied requests from Vercel, Cloudflare, etc.
 * Priority:
 * 1. x-forwarded-for (takes first IP from comma-separated list)
 * 2. x-real-ip
 * 3. Fallback for development
 *
 * @param request - Request object
 * @returns Client IP address
 *
 * @example
 * ```typescript
 * const ip = getClientIp(req);
 * // Returns: "192.168.1.1" or "dev-abc123"
 * ```
 */
export function getClientIp(request: Request): string {
  // Try x-forwarded-for header (Vercel, Cloudflare, proxies)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take first IP from comma-separated list
    return forwardedFor.split(',')[0].trim();
  }

  // Try x-real-ip header (nginx, some proxies)
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // Try CF-Connecting-IP (Cloudflare specific)
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp.trim();
  }

  // Fallback for local development
  return 'dev-' + Math.random().toString(36).substring(7);
}

/**
 * Get user agent from request
 *
 * @param request - Request object
 * @returns User agent string or 'unknown'
 */
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Check if request is from mobile device
 *
 * @param request - Request object
 * @returns true if mobile, false otherwise
 */
export function isMobileRequest(request: Request): boolean {
  const ua = getUserAgent(request).toLowerCase();
  return /mobile|android|iphone|ipad|phone/i.test(ua);
}

/**
 * Check if request is from bot/crawler
 *
 * @param request - Request object
 * @returns true if bot, false otherwise
 */
export function isBotRequest(request: Request): boolean {
  const ua = getUserAgent(request).toLowerCase();
  return /bot|crawler|spider|scraper|curl|wget|postman/i.test(ua);
}

/**
 * Get request origin (protocol + host)
 *
 * @param request - Request object
 * @returns Origin URL (e.g., "https://example.com")
 */
export function getRequestOrigin(request: Request): string {
  const url = new URL(request.url);
  return url.origin;
}

/**
 * Get referer URL from request
 *
 * @param request - Request object
 * @returns Referer URL or null
 */
export function getReferer(request: Request): string | null {
  return request.headers.get('referer');
}

/**
 * Check if request accepts JSON response
 *
 * @param request - Request object
 * @returns true if accepts JSON
 */
export function acceptsJson(request: Request): boolean {
  const accept = request.headers.get('accept') || '';
  return accept.includes('application/json');
}

/**
 * Parse query parameters from request URL
 *
 * @param request - Request object
 * @returns Object with query parameters
 *
 * @example
 * ```typescript
 * // URL: /api/contacts?page=1&limit=20
 * const params = getQueryParams(req);
 * // Returns: { page: '1', limit: '20' }
 * ```
 */
export function getQueryParams(request: Request): Record<string, string> {
  const url = new URL(request.url);
  const params: Record<string, string> = {};

  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

/**
 * Get single query parameter with type conversion
 *
 * @param request - Request object
 * @param key - Parameter key
 * @param defaultValue - Default value if not found
 * @returns Parameter value or default
 */
export function getQueryParam<T = string>(
  request: Request,
  key: string,
  defaultValue?: T
): T {
  const url = new URL(request.url);
  const value = url.searchParams.get(key);

  if (value === null) {
    return defaultValue as T;
  }

  // Try to infer type from defaultValue
  if (typeof defaultValue === 'number') {
    const parsed = parseInt(value);
    return (isNaN(parsed) ? defaultValue : parsed) as T;
  }

  if (typeof defaultValue === 'boolean') {
    return (value === 'true' || value === '1') as T;
  }

  return value as T;
}

/**
 * Get pagination parameters from request
 *
 * @param request - Request object
 * @param defaultPage - Default page number (default: 1)
 * @param defaultLimit - Default limit (default: 20)
 * @returns Pagination parameters
 */
export function getPaginationParams(
  request: Request,
  defaultPage: number = 1,
  defaultLimit: number = 20
): { page: number; limit: number; skip: number } {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || String(defaultPage));
  const limit = parseInt(url.searchParams.get('limit') || String(defaultLimit));

  return {
    page: page < 1 ? defaultPage : page,
    limit: limit < 1 ? defaultLimit : Math.min(limit, 100), // Max 100 items per page
    skip: (page - 1) * limit,
  };
}

/**
 * Check if request is localhost/development
 *
 * @param request - Request object
 * @returns true if localhost
 */
export function isLocalhost(request: Request): boolean {
  const url = new URL(request.url);
  return (
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.hostname.startsWith('192.168.') ||
    url.hostname.startsWith('10.') ||
    url.hostname.startsWith('172.')
  );
}

/**
 * Get request method safely
 *
 * @param request - Request object
 * @returns HTTP method in uppercase
 */
export function getMethod(request: Request): string {
  return request.method.toUpperCase();
}

/**
 * Check if request method matches
 *
 * @param request - Request object
 * @param methods - Method or array of methods to check
 * @returns true if matches
 */
export function isMethod(
  request: Request,
  methods: string | string[]
): boolean {
  const method = getMethod(request);
  const methodsArray = Array.isArray(methods) ? methods : [methods];
  return methodsArray.map((m) => m.toUpperCase()).includes(method);
}

/**
 * Get content type from request
 *
 * @param request - Request object
 * @returns Content type or null
 */
export function getContentType(request: Request): string | null {
  return request.headers.get('content-type');
}

/**
 * Check if request has JSON body
 *
 * @param request - Request object
 * @returns true if JSON content type
 */
export function isJsonBody(request: Request): boolean {
  const contentType = getContentType(request);
  return contentType?.includes('application/json') ?? false;
}
