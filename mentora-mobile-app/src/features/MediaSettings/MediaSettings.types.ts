import { SettingsNavigationProp } from '@/navigation/types';

export interface MediaSettingsScreenProps {
  navigation: SettingsNavigationProp;
}

export interface MediaSettings {
  autoDownloadPhotos: boolean;
  videoAutoplay: boolean;
  mediaQuality: 'low' | 'medium' | 'high';
  blurPrivatePhotos: boolean;
  showMediaInGallery: boolean;
}

export interface MediaSettingsResponse {
  media: MediaSettings;
}

export interface UpdateMediaSettingsPayload extends Partial<MediaSettings> {}
