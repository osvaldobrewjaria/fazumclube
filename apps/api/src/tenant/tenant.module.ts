import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TenantMiddleware } from './tenant.middleware';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  controllers: [TenantController],
  providers: [TenantMiddleware, TenantService],
  exports: [TenantMiddleware, TenantService],
})
export class TenantModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        // Rotas de infraestrutura
        { path: 'health', method: RequestMethod.ALL },
        { path: 'stripe/webhook', method: RequestMethod.POST },
        
        // Rotas de autenticação PLATAFORMA (sem tenant)
        // Usadas por /app/login e /app/signup
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/register', method: RequestMethod.POST },
        { path: 'auth/refresh', method: RequestMethod.POST },
        
        // Rotas de tenant management (plataforma)
        { path: 'tenants/provision', method: RequestMethod.POST },
        { path: 'tenants/check-slug/(.*)', method: RequestMethod.GET },
        { path: 'tenants/my', method: RequestMethod.GET },
        { path: 'tenants/(.*)', method: RequestMethod.ALL },
        
        // Rotas de superadmin (gerenciamento global)
        { path: 'superadmin', method: RequestMethod.ALL },
        { path: 'superadmin/(.*)', method: RequestMethod.ALL },
      )
      .forRoutes('*');
  }
}
