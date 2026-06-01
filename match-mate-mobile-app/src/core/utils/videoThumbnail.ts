import { Platform } from 'react-native';
import * as VideoThumbnails from 'expo-video-thumbnails';

const generateWebVideoThumbnail = (uri: string): Promise<string | undefined> =>
  new Promise((resolve) => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      resolve(undefined);
      return;
    }

    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const timeoutRef: { current?: ReturnType<typeof setTimeout> } = {};

    const cleanup = (): void => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      video.pause();
      video.removeAttribute('src');
      video.load();
    };

    const finish = (thumbnailUri?: string): void => {
      cleanup();
      resolve(thumbnailUri);
    };

    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(1, video.duration || 1);
    };

    video.onseeked = () => {
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 360;
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) {
        finish(undefined);
        return;
      }

      try {
        context.drawImage(video, 0, 0, width, height);
        finish(canvas.toDataURL('image/jpeg', 0.82));
      } catch {
        finish(undefined);
      }
    };

    video.onerror = () => finish(undefined);
    timeoutRef.current = setTimeout(() => finish(undefined), 2500);
    video.src = uri;
  });

export const generateVideoThumbnail = async (
  uri: string
): Promise<string | undefined> => {
  try {
    const thumbnail = await VideoThumbnails.getThumbnailAsync(uri, {
      time: 1000,
    });
    return thumbnail.uri;
  } catch {
    return generateWebVideoThumbnail(uri);
  }
};
