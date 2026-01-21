import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantStatus } from '@prisma/client';

@Injectable()
export class SuperadminService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lista todos os tenants da plataforma
   */
  async getAllTenants(options?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, search, page = 1, limit = 20 } = options || {};

    const where: any = {};

    // Filtro por status
    if (status && status !== 'ALL') {
      where.status = status;
    }

    // Filtro por busca (nome ou slug)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
          users: {
            where: { role: 'ADMIN' },
            select: { id: true, name: true, email: true, role: true },
            take: 5,
          },
          _count: {
            select: {
              users: true,
              subscriptions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return {
      tenants: tenants.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        status: t.status,
        businessType: t.businessType,
        stripeConnected: t.stripeConnected,
        trialEndsAt: t.trialEndsAt,
        deletedAt: t.deletedAt,
        createdAt: t.createdAt,
        owner: t.owner,
        admins: t.users,
        usersCount: t._count.users,
        subscriptionsCount: t._count.subscriptions,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca um tenant específico com detalhes
   */
  async getTenantById(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        plans: true,
        _count: {
          select: {
            users: true,
            subscriptions: true,
            payments: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    return tenant;
  }

  /**
   * Suspende um tenant
   */
  async suspendTenant(tenantId: string, reason?: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    if (tenant.status === 'SUSPENDED') {
      throw new BadRequestException('Tenant já está suspenso');
    }

    if (tenant.status === 'DELETED') {
      throw new BadRequestException('Não é possível suspender um tenant excluído');
    }

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        status: 'SUSPENDED',
        settings: {
          ...(tenant.settings as any || {}),
          suspendedAt: new Date().toISOString(),
          suspendReason: reason || 'Suspenso pelo administrador',
        },
      },
    });

    return {
      message: 'Tenant suspenso com sucesso',
      tenantId,
      status: 'SUSPENDED',
    };
  }

  /**
   * Reativa um tenant suspenso
   */
  async reactivateTenant(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    if (tenant.status === 'DELETED') {
      throw new BadRequestException('Não é possível reativar um tenant excluído');
    }

    if (tenant.status !== 'SUSPENDED') {
      throw new BadRequestException('Tenant não está suspenso');
    }

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        status: 'ACTIVE',
      },
    });

    return {
      message: 'Tenant reativado com sucesso',
      tenantId,
      status: 'ACTIVE',
    };
  }

  /**
   * Exclui um tenant (soft delete) - superadmin pode excluir qualquer tenant
   */
  async deleteTenant(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    if (tenant.status === 'DELETED') {
      throw new BadRequestException('Tenant já foi excluído');
    }

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        status: 'DELETED',
        deletedAt: new Date(),
      },
    });

    return {
      message: 'Tenant excluído com sucesso',
      tenantId,
      deletedAt: new Date().toISOString(),
    };
  }

  /**
   * Restaura um tenant excluído
   */
  async restoreTenant(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    if (tenant.status !== 'DELETED') {
      throw new BadRequestException('Tenant não está excluído');
    }

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        status: 'ACTIVE',
        deletedAt: null,
      },
    });

    return {
      message: 'Tenant restaurado com sucesso',
      tenantId,
      status: 'ACTIVE',
    };
  }

  /**
   * Estatísticas globais da plataforma
   */
  async getPlatformStats() {
    const [
      totalTenants,
      activeTenants,
      trialTenants,
      suspendedTenants,
      deletedTenants,
      totalUsers,
      totalSubscriptions,
      activeSubscriptions,
    ] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.tenant.count({ where: { status: 'ACTIVE' } }),
      this.prisma.tenant.count({ where: { status: 'TRIAL' } }),
      this.prisma.tenant.count({ where: { status: 'SUSPENDED' } }),
      this.prisma.tenant.count({ where: { status: 'DELETED' } }),
      this.prisma.user.count(),
      this.prisma.subscription.count(),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    ]);

    return {
      tenants: {
        total: totalTenants,
        active: activeTenants,
        trial: trialTenants,
        suspended: suspendedTenants,
        deleted: deletedTenants,
      },
      users: {
        total: totalUsers,
      },
      subscriptions: {
        total: totalSubscriptions,
        active: activeSubscriptions,
      },
    };
  }

  /**
   * Cria um admin para um tenant específico
   */
  async createTenantAdmin(tenantId: string, data: { name: string; email: string; password: string }) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    // Verificar se email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email já está em uso');
    }

    // Hash da senha
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Criar usuário admin
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: 'ADMIN',
        tenantId: tenant.id,
        profile: {
          create: {},
        },
      },
    });

    return {
      message: 'Admin criado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Lista admins de um tenant
   */
  async getTenantAdmins(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    const admins = await this.prisma.user.findMany({
      where: { tenantId, role: 'ADMIN' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    return { admins };
  }
}
