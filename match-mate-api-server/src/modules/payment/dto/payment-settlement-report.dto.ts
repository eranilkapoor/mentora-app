import { IsDateString, IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';
import { PaymentGateway } from '../enums/payment-gateway.enum';

export class PaymentSettlementReportDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsEnum(PaymentGateway)
  gateway?: PaymentGateway;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  @Matches(/^[A-Z]{3}$/)
  currency?: string;
}
