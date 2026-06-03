import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export enum BroadcastChannel {
  IN_APP = 'in_app',
  PUSH = 'push',
  EMAIL = 'email',
}

export enum BroadcastTarget {
  ALL = 'all',
  PREMIUM = 'premium',
  UNVERIFIED = 'unverified',
  BLOCKED = 'blocked',
  ACTIVE = 'active',
}

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
