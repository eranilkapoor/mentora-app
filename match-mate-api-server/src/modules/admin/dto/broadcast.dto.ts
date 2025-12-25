import { IsString } from 'class-validator';

export class BroadcastDto {
  @IsString()
  title: string;

  @IsString()
  message: string;
}
