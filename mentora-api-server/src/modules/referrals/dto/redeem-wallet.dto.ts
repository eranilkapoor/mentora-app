import { IsInt, Min } from 'class-validator';

export class RedeemWalletDto {
  @IsInt()
  @Min(1)
  points!: number;
}
