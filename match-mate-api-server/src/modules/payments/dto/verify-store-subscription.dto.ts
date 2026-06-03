import {
  IsIn,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { PaymentGateway } from '../enums/payment-gateway.enum';

export class VerifyStoreSubscriptionDto {
  @IsIn([PaymentGateway.APPLE_IAP, PaymentGateway.GOOGLE_PLAY])
  gateway!: PaymentGateway.APPLE_IAP | PaymentGateway.GOOGLE_PLAY;

  @IsMongoId()
  planId!: string;

  @IsString()
  @MaxLength(160)
  productId!: string;

  @IsString()
  @MaxLength(255)
  transactionId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  originalTransactionId?: string;

  @ValidateIf(
    (dto: VerifyStoreSubscriptionDto) =>
      dto.gateway === PaymentGateway.APPLE_IAP,
  )
  @IsString()
  receiptData?: string;

  @ValidateIf(
    (dto: VerifyStoreSubscriptionDto) =>
      dto.gateway === PaymentGateway.GOOGLE_PLAY,
  )
  @IsString()
  purchaseToken?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  couponCode?: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
