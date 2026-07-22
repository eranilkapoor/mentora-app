import { IsString } from 'class-validator';

export class PurchaseSubscriptionDto {
  @IsString()
  planId!: string;
}
