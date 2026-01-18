import { IsString, IsEnum } from 'class-validator';

enum BillingInterval {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export class CreateCheckoutSessionDto {
  @IsString()
  planSlug!: string;

  @IsEnum(BillingInterval)
  billingInterval!: BillingInterval;
}
