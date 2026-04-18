import { IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class AdminRefundPaymentDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;
}
