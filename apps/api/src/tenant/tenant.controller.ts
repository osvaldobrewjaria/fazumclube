import { Controller, Post, Get, Put, Delete, Body, Param, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { ProvisionTenantDto } from './dto/provision-tenant.dto';
import { UpdateTenantSettingsDto, CreatePlanDto, UpdatePlanDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  /**
   * GET /tenants/my
   * 
   * Lista todos os tenants que o usuário logado é owner.
   * Usado no /app/dashboard.
   */
  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyTenants(@Req() req: any) {
    const userId = req.user.sub || req.user.id;
    return this.tenantService.getTenantsByOwner(userId);
  }

  /**
   * POST /tenants/provision
   * 
   * Endpoint de provisionamento self-service.
   * Cria um novo tenant + usuário owner em uma única operação.
   * 
   * Não requer autenticação (é o primeiro passo do onboarding).
   */
  @Post('provision')
  @HttpCode(HttpStatus.CREATED)
  async provisionTenant(@Body() dto: ProvisionTenantDto) {
    return this.tenantService.provisionTenant(dto);
  }

  /**
   * GET /tenants/check-slug/:slug
   * 
   * Verifica se um slug está disponível.
   * Usado no wizard para validar em tempo real.
   */
  @Get('check-slug/:slug')
  async checkSlugAvailability(@Param('slug') slug: string) {
    const available = await this.tenantService.isSlugAvailable(slug);
    return { 
      slug, 
      available,
      message: available ? 'Slug disponível' : 'Slug já está em uso',
    };
  }

  /**
   * GET /tenants/:slug
   * 
   * Busca informações públicas de um tenant.
   * Usado para resolver tenant por slug.
   */
  @Get(':slug')
  async getTenantBySlug(@Param('slug') slug: string) {
    const tenant = await this.tenantService.findBySlug(slug);
    
    if (!tenant) {
      return { 
        found: false, 
        message: 'Tenant não encontrado' 
      };
    }

    // Verificar se tenant está suspenso ou deletado
    if (tenant.status === 'SUSPENDED') {
      return {
        found: false,
        suspended: true,
        message: 'Este clube está temporariamente suspenso. Entre em contato com o suporte.',
      };
    }

    if (tenant.status === 'DELETED') {
      return {
        found: false,
        message: 'Tenant não encontrado',
      };
    }

    // Retorna informações públicas + planos
    return {
      found: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        businessType: tenant.businessType,
        tagline: (tenant as any).tagline,
        description: (tenant as any).description,
        settings: tenant.settings,
      },
      plans: (tenant as any).plans || [],
    };
  }

  // ========== Endpoints Autenticados ==========

  /**
   * PUT /tenants/:tenantId/settings
   * 
   * Atualiza configurações do tenant.
   * Requer autenticação.
   */
  @Put(':tenantId/settings')
  @UseGuards(JwtAuthGuard, TenantGuard)
  async updateTenantSettings(
    @Param('tenantId') tenantId: string,
    @Body() dto: UpdateTenantSettingsDto,
  ) {
    return this.tenantService.updateTenantSettings(tenantId, dto);
  }

  // ========== Endpoints de Planos ==========

  /**
   * GET /tenants/:tenantId/plans
   * 
   * Lista planos do tenant.
   */
  @Get(':tenantId/plans')
  async getPlans(@Param('tenantId') tenantId: string) {
    return this.tenantService.getPlans(tenantId);
  }

  /**
   * POST /tenants/:tenantId/plans
   * 
   * Cria um novo plano.
   * Requer autenticação.
   */
  @Post(':tenantId/plans')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPlan(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreatePlanDto,
  ) {
    return this.tenantService.createPlan(tenantId, dto);
  }

  /**
   * PUT /tenants/:tenantId/plans/:planId
   * 
   * Atualiza um plano.
   * Requer autenticação.
   */
  @Put(':tenantId/plans/:planId')
  @UseGuards(JwtAuthGuard, TenantGuard)
  async updatePlan(
    @Param('tenantId') tenantId: string,
    @Param('planId') planId: string,
    @Body() dto: UpdatePlanDto,
  ) {
    return this.tenantService.updatePlan(tenantId, planId, dto);
  }

  /**
   * DELETE /tenants/:tenantId/plans/:planId
   * 
   * Exclui um plano (soft delete).
   * Requer autenticação.
   */
  @Delete(':tenantId/plans/:planId')
  @UseGuards(JwtAuthGuard, TenantGuard)
  async deletePlan(
    @Param('tenantId') tenantId: string,
    @Param('planId') planId: string,
  ) {
    return this.tenantService.deletePlan(tenantId, planId);
  }

  // ========== Soft Delete de Tenant ==========

  /**
   * DELETE /tenants/:tenantId
   * 
   * Soft delete do tenant.
   * Marca status=DELETED e deletedAt=now.
   * Apenas o owner pode excluir.
   */
  @Delete(':tenantId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteTenant(
    @Param('tenantId') tenantId: string,
    @Req() req: any,
  ) {
    const userId = req.user.sub || req.user.id;
    return this.tenantService.deleteTenant(tenantId, userId);
  }
}
