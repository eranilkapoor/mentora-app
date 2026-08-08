import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaymentGateway } from '@/modules/payments/enums/payment-gateway.enum';
import { SubscriptionStatus } from '@/common/enums';

export class AssignOrganizationSubscriptionDto {
  @IsMongoId()
  organizationId!: string;

  @IsMongoId()
  planId!: string;

  @IsOptional()
  @IsEnum(PaymentGateway)
  paymentProvider?: PaymentGateway;

  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus.ACTIVE | SubscriptionStatus.TRIAL;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  reason?: string;
}
