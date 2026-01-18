import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';

// Extend Express Request to include tenant
declare global {
  namespace Express {
    interface Request {
      tenant?: {
        id: string;
        slug: string;
        name: string;
      };
    }
  }
}

// Mapeamento de domínios para slugs de tenant
// IMPORTANTE: slugs devem corresponder ao banco de dados
const DOMAIN_TO_TENANT: Record<string, string> = {
  // Brewjaria (produção)
  'brewjaria.com.br': 'brewjaria',
  'www.brewjaria.com.br': 'brewjaria',
  'brewjaria-web.vercel.app': 'brewjaria',
  
  // Wine Club
  'wineclub.com.br': 'wine-club',
  'www.wineclub.com.br': 'wine-club',
  
  // Coffee Club
  'coffee-club.com.br': 'coffee-club',
  'www.coffee-club.com.br': 'coffee-club',
  
  // Pet Box
  'pet-box.com.br': 'pet-box',
  'www.pet-box.com.br': 'pet-box',
};

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // 1. Tentar resolver por header X-Tenant (prioridade máxima)
    let tenantSlug = req.headers['x-tenant'] as string;

    // 2. Se não tiver header, tentar resolver por Host
    if (!tenantSlug) {
      const host = req.headers.host?.split(':')[0]?.toLowerCase();
      if (host && DOMAIN_TO_TENANT[host]) {
        tenantSlug = DOMAIN_TO_TENANT[host];
      }
    }

    // 3. Fallback para tenant padrão em desenvolvimento
    if (!tenantSlug) {
      const defaultTenant = process.env.DEFAULT_TENANT_SLUG;
      if (defaultTenant) {
        tenantSlug = defaultTenant;
      }
    }

    // Se ainda não tiver tenant, retornar erro
    if (!tenantSlug) {
      throw new BadRequestException(
        'Invalid tenant. Please provide X-Tenant header or use a valid domain.',
      );
    }

    // Validar tenant no banco
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: { id: true, slug: true, name: true },
    });

    if (!tenant) {
      throw new BadRequestException(`Invalid tenant: ${tenantSlug}`);
    }

    // Injetar tenant no request
    req.tenant = {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
    };

    next();
  }
}
