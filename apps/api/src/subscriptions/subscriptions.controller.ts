import { Controller, Post, Get, Delete, Body, Request, UseGuards, NotFoundException } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, TenantGuard) // TenantGuard valida que usuário pertence ao tenant
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('checkout-session')
  async createCheckoutSession(
    @Request() req: any,
    @Body() dto: CreateCheckoutSessionDto,
  ) {
    return this.subscriptionsService.createCheckoutSession(req.user.sub, dto);
  }

  @Get('me')
  async getSubscription(@Request() req: any) {
    const subscription = await this.subscriptionsService.getSubscription(req.user.sub);
    // Retorna null ao invés de erro quando não há assinatura
    return subscription || null;
  }

  @Delete('cancel')
  async cancelSubscription(@Request() req: any) {
    return this.subscriptionsService.cancelSubscription(req.user.sub);
  }

  @Post('pause')
  async pauseSubscription(@Request() req: any) {
    return this.subscriptionsService.pauseSubscription(req.user.sub);
  }

  @Post('resume')
  async resumeSubscription(@Request() req: any) {
    return this.subscriptionsService.resumeSubscription(req.user.sub);
  }
}
