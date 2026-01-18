import { IsString, IsOptional, IsObject, IsBoolean, IsNumber, IsArray } from 'class-validator';

export class UpdateTenantSettingsDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  tagline?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  contact?: {
    email?: string;
    phone?: string;
    whatsapp?: string;
    instagram?: string;
    address?: string;
  };

  @IsOptional()
  @IsObject()
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
  };

  @IsOptional()
  @IsObject()
  content?: {
    heroTitle?: string;
    heroSubtitle?: string;
    ctaText?: string;
  };

  @IsOptional()
  @IsObject()
  images?: {
    logoUrl?: string;
    heroImageUrl?: string;
  };

  @IsOptional()
  @IsObject()
  sections?: {
    featuresTitle?: string;
    featuresSubtitle?: string;
    features?: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };

  @IsOptional()
  @IsArray()
  testimonials?: Array<{
    name: string;
    role: string;
    content: string;
    rating: number;
  }>;

  @IsOptional()
  @IsArray()
  faq?: Array<{
    question: string;
    answer: string;
  }>;

  @IsOptional()
  @IsObject()
  layout?: {
    showTestimonials?: boolean;
    showFAQ?: boolean;
    showFeatures?: boolean;
  };
}

export class CreatePlanDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  price!: number;

  @IsString()
  interval!: 'monthly' | 'yearly';

  @IsOptional()
  @IsArray()
  features?: string[];

  @IsOptional()
  @IsBoolean()
  highlighted?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdatePlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  interval?: 'monthly' | 'yearly';

  @IsOptional()
  @IsArray()
  features?: string[];

  @IsOptional()
  @IsBoolean()
  highlighted?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
