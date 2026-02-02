import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  planId?: string;
}
