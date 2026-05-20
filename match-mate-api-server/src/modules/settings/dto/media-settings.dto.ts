import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class UpdateMediaSettingsDto {
  @IsOptional() @IsBoolean() autoDownloadPhotos?: boolean;
  @IsOptional() @IsBoolean() videoAutoplay?: boolean;
  @IsOptional() @IsEnum(['low', 'medium', 'high']) mediaQuality?: string;
  @IsOptional() @IsBoolean() blurPrivatePhotos?: boolean;
  @IsOptional() @IsBoolean() showMediaInGallery?: boolean;
}
