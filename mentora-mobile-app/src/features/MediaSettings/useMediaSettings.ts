import { useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { DEFAULT_MEDIA_SETTINGS } from '@/store/slices/settings.slice';
import type { MediaSettings } from './MediaSettings.types';

interface MediaSettingsState extends MediaSettings {
  shouldAutoplayVideo: boolean;
  shouldPrefetchPhotos: boolean;
  shouldBlurPrivatePhotos: boolean;
  imageResizeMethod: 'resize' | 'scale';
}

export function useMediaSettings(): MediaSettingsState {
  const media = useAppSelector(
    (state) => state.settings.media ?? DEFAULT_MEDIA_SETTINGS
  );

  return useMemo(
    () => ({
      ...DEFAULT_MEDIA_SETTINGS,
      ...media,
      shouldAutoplayVideo: Boolean(media.videoAutoplay),
      shouldPrefetchPhotos: Boolean(
        media.autoDownloadPhotos && media.showMediaInGallery
      ),
      shouldBlurPrivatePhotos: Boolean(media.blurPrivatePhotos),
      imageResizeMethod: media.mediaQuality === 'high' ? 'scale' : 'resize',
    }),
    [media]
  );
}
