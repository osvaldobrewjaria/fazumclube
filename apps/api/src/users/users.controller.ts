import {
  Controller,
  Get,
  Patch,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, TenantGuard) // TenantGuard valida que usuário pertence ao tenant
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ======================================================
  // GET /users/me
  // ======================================================
  @Get('me')
  async getProfile(@Request() req: any) {
    return this.usersService.getProfile(req.user.sub);
  }

  // ======================================================
  // PATCH /users/me
  // ======================================================
  @Patch('me')
  async updateProfile(
    @Request() req: any,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.sub, dto);
  }
}
