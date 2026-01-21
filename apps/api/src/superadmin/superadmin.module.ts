import { Module } from '@nestjs/common';
import { SuperadminController } from './superadmin.controller';
import { SuperadminService } from './superadmin.service';
import { SuperadminGuard } from './superadmin.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SuperadminController],
  providers: [SuperadminService, SuperadminGuard],
  exports: [SuperadminGuard],
})
export class SuperadminModule {}
