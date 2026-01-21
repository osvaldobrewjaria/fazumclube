import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { ProvisionTenantDto } from './dto/provision-tenant.dto';
import { UpdateTenantSettingsDto, CreatePlanDto, UpdatePlanDto } from './dto/update-tenant.dto';
import { TenantStatus } from '@prisma/client';

@Injectable()
export class TenantService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Provisiona um novo tenant com owner
   * Fluxo self-service: cria tenant + usuário owner em uma transação
   */
  async provisionTenant(dto: ProvisionTenantDto) {
    const {
      ownerName,
      ownerEmail,
      ownerPassword,
      tenantName,
      tenantSlug,
      businessType,
      currency = 'BRL',
      country = 'BR',
      timezone = 'America/Sao_Paulo',
    } = dto;

    // ========== Validações ==========

    // 1. Verificar se email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: ownerEmail },
    });
    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    // 2. Verificar se slug já existe
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });
    if (existingTenant) {
      throw new ConflictException('Este slug já está em uso. Escolha outro nome para sua marca.');
    }

    // ========== Criar Tenant + Owner em Transação ==========

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Criar o tenant primeiro (sem owner ainda)
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          slug: tenantSlug,
          businessType,
          status: TenantStatus.TRIAL,
          trialEndsAt: this.calculateTrialEnd(),
          settings: {
            currency,
            country,
            timezone,
          },
        },
      });

      // 2. Hash da senha
      const hashedPassword = await bcrypt.hash(ownerPassword, 10);

      // 3. Criar o usuário owner
      const owner = await tx.user.create({
        data: {
          name: ownerName,
          email: ownerEmail,
          password: hashedPassword,
          role: 'ADMIN', // Owner é admin do tenant
          tenantId: tenant.id,
          profile: {
            create: {},
          },
        },
      });

      // 4. Atualizar tenant com ownerId
      const updatedTenant = await tx.tenant.update({
        where: { id: tenant.id },
        data: { ownerId: owner.id },
      });

      return { tenant: updatedTenant, owner };
    });

    // ========== Gerar Tokens ==========

    const tokens = await this.generateTokens(result.owner.id);

    // ========== Retornar Resultado ==========

    return {
      message: 'Tenant criado com sucesso!',
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        slug: result.tenant.slug,
        businessType: result.tenant.businessType,
        status: result.tenant.status,
        trialEndsAt: result.tenant.trialEndsAt,
      },
      owner: {
        id: result.owner.id,
        name: result.owner.name,
        email: result.owner.email,
        role: result.owner.role,
      },
      ...tokens,
    };
  }

  /**
   * Busca tenant por slug (inclui planos ativos)
   */
  async findBySlug(slug: string) {
    return this.prisma.tenant.findUnique({
      where: { slug },
      include: {
        plans: {
          where: { active: true },
          orderBy: { price: 'asc' },
        },
      },
    });
  }

  /**
   * Verifica se slug está disponível
   */
  async isSlugAvailable(slug: string): Promise<boolean> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
    });
    return !tenant;
  }

  /**
   * Lista todos os tenants que o usuário é owner
   * Inclui métricas básicas (assinantes ativos, MRR)
   */
  async getTenantsByOwner(userId: string) {
    const tenants = await this.prisma.tenant.findMany({
      where: { 
        ownerId: userId,
        status: { not: 'DELETED' },
      },
      include: {
        _count: {
          select: {
            subscriptions: {
              where: { status: 'ACTIVE' },
            },
          },
        },
        subscriptions: {
          where: { status: 'ACTIVE' },
          select: {
            plan: {
              select: { price: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tenants.map((tenant) => {
      // Calcular MRR (soma dos preços dos planos ativos)
      const mrr = tenant.subscriptions.reduce((sum, sub) => {
        return sum + (sub.plan?.price || 0);
      }, 0);

      return {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        status: tenant.status,
        businessType: tenant.businessType,
        stripeConnected: tenant.stripeConnected,
        stripeOnboardingComplete: tenant.stripeOnboardingComplete,
        trialEndsAt: tenant.trialEndsAt,
        createdAt: tenant.createdAt,
        subscribersCount: tenant._count.subscriptions,
        mrr,
      };
    });
  }

  /**
   * Calcula data de fim do trial (14 dias)
   */
  private calculateTrialEnd(): Date {
    const trialDays = 14;
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + trialDays);
    return trialEnd;
  }

  /**
   * Gera tokens JWT
   */
  private async generateTokens(userId: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId },
      {
        secret: process.env.JWT_SECRET || '',
        expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any,
      },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId },
      {
        secret: process.env.JWT_REFRESH_SECRET || '',
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as any,
      },
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  // ========== Métodos de Atualização do Tenant ==========

  /**
   * Atualiza configurações do tenant
   */
  async updateTenantSettings(tenantId: string, dto: UpdateTenantSettingsDto) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    // Mesclar settings existentes com novos
    const currentSettings = (tenant.settings as any) || {};
    const updatedSettings = {
      ...currentSettings,
      contact: dto.contact ? { ...currentSettings.contact, ...dto.contact } : currentSettings.contact,
      theme: dto.theme ? { ...currentSettings.theme, ...dto.theme } : currentSettings.theme,
      content: dto.content ? { ...currentSettings.content, ...dto.content } : currentSettings.content,
      images: dto.images ? { ...currentSettings.images, ...dto.images } : currentSettings.images,
      sections: dto.sections ? { ...currentSettings.sections, ...dto.sections } : currentSettings.sections,
      testimonials: dto.testimonials !== undefined ? dto.testimonials : currentSettings.testimonials,
      faq: dto.faq !== undefined ? dto.faq : currentSettings.faq,
      layout: dto.layout ? { ...currentSettings.layout, ...dto.layout } : currentSettings.layout,
    };

    const updated = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: dto.name ?? tenant.name,
        tagline: dto.tagline ?? (tenant as any).tagline,
        description: dto.description ?? (tenant as any).description,
        settings: updatedSettings,
      } as any,
    });

    return {
      message: 'Configurações atualizadas com sucesso',
      tenant: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        tagline: (updated as any).tagline,
        description: (updated as any).description,
        settings: updated.settings,
      },
    };
  }

  /**
   * Busca tenant completo por ID (para admin)
   */
  async getTenantById(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        plans: {
          where: { active: true },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    return tenant;
  }

  // ========== Métodos de Planos ==========

  /**
   * Lista planos do tenant
   */
  async getPlans(tenantId: string) {
    return this.prisma.plan.findMany({
      where: { tenantId, active: true },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Cria um novo plano
   */
  async createPlan(tenantId: string, dto: CreatePlanDto) {
    // Gerar slug único
    const baseSlug = dto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const slug = `${baseSlug}-${Date.now()}`;
    
    const plan = await (this.prisma.plan.create as any)({
      data: {
        tenantId,
        name: dto.name,
        slug,
        description: dto.description || '',
        price: dto.price,
        interval: dto.interval === 'yearly' ? 'YEARLY' : 'MONTHLY',
        features: dto.features || [],
        highlighted: dto.highlighted || false,
        active: dto.active ?? true,
      },
    });

    return {
      message: 'Plano criado com sucesso',
      plan,
    };
  }

  /**
   * Atualiza um plano
   */
  async updatePlan(tenantId: string, planId: string, dto: UpdatePlanDto) {
    const plan = await this.prisma.plan.findFirst({
      where: { id: planId, tenantId },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    const updated = await (this.prisma.plan.update as any)({
      where: { id: planId },
      data: {
        name: dto.name ?? plan.name,
        description: dto.description ?? plan.description,
        price: dto.price ?? (plan as any).price,
        interval: dto.interval ? (dto.interval === 'yearly' ? 'YEARLY' : 'MONTHLY') : (plan as any).interval,
        features: dto.features ?? (plan as any).features,
        highlighted: dto.highlighted ?? (plan as any).highlighted,
        active: dto.active ?? plan.active,
      },
    });

    return {
      message: 'Plano atualizado com sucesso',
      plan: updated,
    };
  }

  /**
   * Exclui um plano (soft delete - marca como inativo)
   */
  async deletePlan(tenantId: string, planId: string) {
    const plan = await this.prisma.plan.findFirst({
      where: { id: planId, tenantId },
    });

    if (!plan) {
      throw new NotFoundException('Plano não encontrado');
    }

    await this.prisma.plan.update({
      where: { id: planId },
      data: { active: false },
    });

    return {
      message: 'Plano excluído com sucesso',
    };
  }

  // ========== Soft Delete de Tenant ==========

  /**
   * Soft delete de um tenant
   * Marca status=DELETED e deletedAt=now
   * Apenas o owner pode excluir
   */
  async deleteTenant(tenantId: string, userId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    // Verificar se o usuário é o owner
    if (tenant.ownerId !== userId) {
      throw new BadRequestException('Apenas o owner pode excluir o tenant');
    }

    // Verificar se já está deletado
    if (tenant.status === 'DELETED') {
      throw new BadRequestException('Tenant já foi excluído');
    }

    // Soft delete
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
   * Verifica se um tenant está ativo (não deletado/suspenso)
   */
  async isTenantActive(tenantId: string): Promise<boolean> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { status: true },
    });

    if (!tenant) return false;

    return tenant.status === 'ACTIVE' || tenant.status === 'TRIAL';
  }
}
