import { IsObject, IsOptional, IsString } from 'class-validator';

export class GooglePlayRtdnEnvelopeDto {
  @IsObject()
  message!: {
    data?: string;
    messageId?: string;
    publishTime?: string;
  };

  @IsOptional()
  @IsString()
  subscription?: string;
}
