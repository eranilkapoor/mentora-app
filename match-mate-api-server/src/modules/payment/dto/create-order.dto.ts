import {
  IsEnum,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Matches,
} from 'class-validator';
import { PaymentGateway } from '../enums/payment-gateway.enum';
import { PaymentPurpose } from '../enums/payment-purpose.enum';

export class CreateOrderDto {
  @IsMongoId()
  planId!: string;

  @IsOptional()
  @IsEnum(PaymentGateway)
  gateway?: PaymentGateway;

  @IsOptional()
  @IsEnum(PaymentPurpose)
  purpose?: PaymentPurpose;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  @Matches(/^[A-Z]{3}$/)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  idempotencyKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
