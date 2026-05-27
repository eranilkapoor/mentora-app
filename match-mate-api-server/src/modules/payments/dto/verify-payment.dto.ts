import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaymentMethod } from '../enums/payment-method.enum';

export class VerifyPaymentDto {
  @IsString()
  orderId!: string;

  @IsString()
  gatewayPaymentId!: string;

  @IsOptional()
  @IsString()
  gatewayOrderId?: string;

  @IsString()
  @MaxLength(512)
  signature!: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

  @IsOptional()
  @IsObject()
  gatewayPayload?: Record<string, unknown>;
}
