import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// Interface para tenant do request
interface TenantContext {
  id: string;
  slug: string;
  name: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(dto: RegisterDto, tenant: TenantContext) {
    const { name, email, password } = dto;

    // Validar que tenant foi resolvido
    if (!tenant || !tenant.id) {
      throw new BadRequestException('Tenant context is required for registration');
    }

    // Verifica se email já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria usuário usando o tenant do contexto (não mais hardcoded)
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        tenantId: tenant.id, // Usa tenant do contexto

        profile: {
          create: {}, // cria perfil vazio
        },
      },
      include: {
        profile: true,
      },
    });

    // Retorna usuário + tokens
    const tokens = await this.generateTokens(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refresh(userId: string) {
    const tokens = await this.generateTokens(userId);
    return tokens;
  }

  private async generateTokens(userId: string) {
    // Buscar tenantId do usuário para incluir no token
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { tenantId: true, role: true },
    });

    const payload = {
      sub: userId,
      tenantId: user?.tenantId, // Incluir tenantId no JWT para validação de autorização
      role: user?.role,
    };

    const accessToken = this.jwtService.sign(
      payload,
      {
        secret: process.env.JWT_SECRET || '',
        expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any,
      },
    );

    const refreshToken = this.jwtService.sign(
      payload,
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

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || '',
      });
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Não revelar se o email existe ou não
    if (!user) {
      return { message: 'Se o email existir, você receberá um link de recuperação' };
    }

    // Gerar token de reset
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token válido por 1 hora

    // Salvar token no banco
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt,
      },
    });

    // Construir link de reset
    const resetLink = `${process.env.WEB_URL}/redefinir-senha?token=${resetToken}`;

    // Enviar email
    try {
      await this.emailService.sendPasswordResetEmail(email, resetLink);
      console.log('✅ Password reset email sent to:', email);
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      // Não revelar erro ao usuário por segurança
    }

    return { message: 'Se o email existir, você receberá um link de recuperação' };
  }

  async resetPassword(token: string, newPassword: string) {
    // Buscar token válido
    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() },
        used: false,
      },
      include: { user: true },
    });

    if (!resetToken) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha do usuário
    await this.prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Marcar token como usado
    await this.prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    return { message: 'Senha redefinida com sucesso' };
  }
}
