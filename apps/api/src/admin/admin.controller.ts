import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards, Res, Header } from '@nestjs/common';
import { Response } from 'express';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, TenantGuard, AdminGuard) // TenantGuard valida se usuário pertence ao tenant
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search,
    );
  }

  @Get('users/:id')
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Get('subscriptions')
  async getSubscriptions(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getSubscriptions(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      status,
    );
  }

  @Get('subscriptions/:id')
  async getSubscriptionById(@Param('id') id: string) {
    return this.adminService.getSubscriptionById(id);
  }

  @Get('deliveries/export')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename=entregas.csv')
  async exportDeliveries(@Res() res: Response) {
    const csv = await this.adminService.exportDeliveriesCSV();
    res.send(csv);
  }

  @Get('deliveries')
  async getDeliveries(
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.adminService.getDeliveries(
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined,
    );
  }

  @Put('deliveries/:subscriptionId')
  async updateDeliveryStatus(
    @Param('subscriptionId') subscriptionId: string,
    @Query('month') month: string,
    @Query('year') year: string,
    @Body() body: {
      status?: string;
      trackingCode?: string;
      trackingUrl?: string;
      notes?: string;
    },
  ) {
    return this.adminService.updateDeliveryStatus(
      subscriptionId,
      parseInt(month),
      parseInt(year),
      body,
    );
  }

  @Post('deliveries/bulk-update')
  async bulkUpdateDeliveryStatus(
    @Body() body: {
      subscriptionIds: string[];
      month: number;
      year: number;
      status: string;
    },
  ) {
    return this.adminService.bulkUpdateDeliveryStatus(
      body.subscriptionIds,
      body.month,
      body.year,
      body.status,
    );
  }

  @Get('payments')
  async getPayments(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getPayments(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      status,
    );
  }

  @Post('fix-subscription-dates')
  async fixSubscriptionDates() {
    return this.adminService.fixSubscriptionDates();
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }
}
