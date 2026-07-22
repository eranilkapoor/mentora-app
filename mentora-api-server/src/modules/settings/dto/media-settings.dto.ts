import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { MediaQuality } from '../enums/settings-preferences.enums';

export class UpdateMediaSettingsDto {
  @IsOptional() @IsBoolean() autoDownloadPhotos?: boolean;
  @IsOptional() @IsBoolean() videoAutoplay?: boolean;
  @IsOptional() @IsEnum(MediaQuality) mediaQuality?: MediaQuality;
  @IsOptional() @IsBoolean() blurPrivatePhotos?: boolean;
  @IsOptional() @IsBoolean() showMediaInGallery?: boolean;
}
