import { IsString, IsEmail, MinLength, IsEnum, IsOptional, Matches } from 'class-validator';
import { BusinessType } from '@prisma/client';

/**
 * DTO para provisionamento self-service de tenant
 * Usado no wizard de onboarding
 */
export class ProvisionTenantDto {
  // ========== Dados do Owner ==========
  
  @IsString()
  @MinLength(2, { message: 'Nome deve ter pelo menos 2 caracteres' })
  ownerName!: string;

  @IsEmail({}, { message: 'Email inválido' })
  ownerEmail!: string;

  @IsString()
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  ownerPassword!: string;

  // ========== Dados do Tenant ==========
  
  @IsString()
  @MinLength(2, { message: 'Nome da marca deve ter pelo menos 2 caracteres' })
  tenantName!: string;

  @IsString()
  @MinLength(3, { message: 'Slug deve ter pelo menos 3 caracteres' })
  @Matches(/^[a-z0-9-]+$/, { 
    message: 'Slug deve conter apenas letras minúsculas, números e hífens' 
  })
  tenantSlug!: string;

  @IsEnum(BusinessType, { message: 'Tipo de negócio inválido' })
  businessType!: BusinessType;

  // ========== Configurações Opcionais ==========
  
  @IsOptional()
  @IsString()
  currency?: string = 'BRL';

  @IsOptional()
  @IsString()
  country?: string = 'BR';

  @IsOptional()
  @IsString()
  timezone?: string = 'America/Sao_Paulo';
}
