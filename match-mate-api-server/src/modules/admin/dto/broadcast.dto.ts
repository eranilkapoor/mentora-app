import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { BroadcastChannel, BroadcastTarget } from '../enums/broadcast.enums';

export class BroadcastDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsOptional()
  @IsEnum(BroadcastTarget)
  target?: BroadcastTarget;

  @IsOptional()
  @IsArray()
  @IsEnum(BroadcastChannel, { each: true })
  channels?: BroadcastChannel[];
}
