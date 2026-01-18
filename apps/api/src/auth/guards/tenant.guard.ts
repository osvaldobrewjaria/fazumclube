import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

/**
 * TenantGuard - Valida se o usuário autenticado pertence ao tenant da requisição
 * 
 * IMPORTANTE: Este guard deve ser usado APÓS JwtAuthGuard
 * 
 * Uso:
 * @UseGuards(JwtAuthGuard, TenantGuard)
 * 
 * Corrige BUG-002: Sessão global permite acesso admin entre tenants
 */
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tenant = request.tenant;

    // Se não há tenant no request, permitir (rota de plataforma)
    if (!tenant) {
      return true;
    }

    // Se não há usuário autenticado, deixar JwtAuthGuard lidar
    if (!user) {
      return true;
    }

    // Validar se o usuário pertence ao tenant da requisição
    if (user.tenantId && tenant.id && user.tenantId !== tenant.id) {
      throw new ForbiddenException(
        `Access denied. You don't have permission to access this tenant.`
      );
    }

    return true;
  }
}
