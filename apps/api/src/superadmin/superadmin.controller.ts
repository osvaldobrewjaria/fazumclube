import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { SuperadminService } from './superadmin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperadminGuard } from './superadmin.guard';

@Controller('superadmin')
@UseGuards(JwtAuthGuard, SuperadminGuard)
export class SuperadminController {
  constructor(private readonly superadminService: SuperadminService) {}

  /**
   * GET /superadmin/stats
   * Estatísticas globais da plataforma
   */
  @Get('stats')
  async getPlatformStats() {
    return this.superadminService.getPlatformStats();
  }

  /**
   * GET /superadmin/tenants
   * Lista todos os tenants da plataforma
   */
  @Get('tenants')
  async getAllTenants(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.superadminService.getAllTenants({
      status,
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  /**
   * GET /superadmin/tenants/:id
   * Detalhes de um tenant específico
   */
  @Get('tenants/:id')
  async getTenantById(@Param('id') id: string) {
    return this.superadminService.getTenantById(id);
  }

  /**
   * POST /superadmin/tenants/:id/suspend
   * Suspende um tenant
   */
  @Post('tenants/:id/suspend')
  @HttpCode(HttpStatus.OK)
  async suspendTenant(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.superadminService.suspendTenant(id, body.reason);
  }

  /**
   * POST /superadmin/tenants/:id/reactivate
   * Reativa um tenant suspenso
   */
  @Post('tenants/:id/reactivate')
  @HttpCode(HttpStatus.OK)
  async reactivateTenant(@Param('id') id: string) {
    return this.superadminService.reactivateTenant(id);
  }

  /**
   * DELETE /superadmin/tenants/:id
   * Exclui um tenant (soft delete)
   */
  @Delete('tenants/:id')
  @HttpCode(HttpStatus.OK)
  async deleteTenant(@Param('id') id: string) {
    return this.superadminService.deleteTenant(id);
  }

  /**
   * POST /superadmin/tenants/:id/restore
   * Restaura um tenant excluído
   */
  @Post('tenants/:id/restore')
  @HttpCode(HttpStatus.OK)
  async restoreTenant(@Param('id') id: string) {
    return this.superadminService.restoreTenant(id);
  }

  /**
   * GET /superadmin/tenants/:id/admins
   * Lista admins de um tenant
   */
  @Get('tenants/:id/admins')
  async getTenantAdmins(@Param('id') id: string) {
    return this.superadminService.getTenantAdmins(id);
  }

  /**
   * POST /superadmin/tenants/:id/admins
   * Cria um admin para um tenant
   */
  @Post('tenants/:id/admins')
  @HttpCode(HttpStatus.CREATED)
  async createTenantAdmin(
    @Param('id') id: string,
    @Body() body: { name: string; email: string; password: string },
  ) {
    return this.superadminService.createTenantAdmin(id, body);
  }
}
