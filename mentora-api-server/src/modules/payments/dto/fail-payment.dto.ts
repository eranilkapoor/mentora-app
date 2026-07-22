import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class FailPaymentDto {
  @IsString()
  orderId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  failureCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  failureReason?: string;

  @IsOptional()
  @IsObject()
  gatewayPayload?: Record<string, unknown>;
}
