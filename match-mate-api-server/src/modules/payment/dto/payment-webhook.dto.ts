import { IsEnum, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';

export class PaymentWebhookDto {
  @IsString()
  @MaxLength(100)
  eventId!: string;

  @IsString()
  orderId!: string;

  @IsOptional()
  @IsString()
  gatewayPaymentId?: string;

  @IsEnum(PaymentStatus)
  status!: PaymentStatus;

  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @IsOptional()
  @IsString()
  failureCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  failureReason?: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
