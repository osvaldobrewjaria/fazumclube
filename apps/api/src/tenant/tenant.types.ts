/**
 * Tenant Context - injetado no request pelo TenantMiddleware
 */
export interface TenantContext {
  id: string;
  slug: string;
  name: string;
}

/**
 * Extend Express Request para incluir tenant
 */
declare global {
  namespace Express {
    interface Request {
      tenant?: TenantContext;
    }
  }
}
