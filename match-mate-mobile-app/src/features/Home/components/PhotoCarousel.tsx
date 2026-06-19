import React, { useCallback, useEffect, useRef } from 'react';
import {
  FlatList,
  Image,
  ListRenderItem,
  useWindowDimensions,
} from 'react-native';
import { getResponsiveMediaWidth } from '@/core/utils/device';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { homeStyles } from '../Home.styles';
import { FALLBACK_PHOTO } from '../Home.constants';
import { useMediaSettings } from '@/features/MediaSettings/useMediaSettings';

interface Props {
  photos: string[];
  name: string;
}

export const PhotoCarousel = React.memo(function PhotoCarousel({
  photos,
  name,
}: Props): React.ReactElement {
  const styles = useThemedStyles(homeStyles);
  const { width } = useWindowDimensions();
  const { imageResizeMethod, shouldPrefetchPhotos } = useMediaSettings();
  const photoWidth = getResponsiveMediaWidth(width, 32);
  // Use a ref instead of state — avoids re-renders from error tracking
  const failedPhotos = useRef<Set<string>>(new Set());

  const renderPhoto: ListRenderItem<string> = useCallback(
    ({ item }) => {
      const uri = failedPhotos.current.has(item)
        ? (FALLBACK_PHOTO as string)
        : item;
      return (
        <Image
          source={typeof uri === 'string' ? { uri } : uri}
          style={[styles.photo, { width: photoWidth }]}
          resizeMode="cover"
          resizeMethod={imageResizeMethod}
          accessibilityLabel={`Photo of ${name}`}
          onError={() => {
            failedPhotos.current.add(item);
          }}
        />
      );
    },
    [imageResizeMethod, name, photoWidth, styles]
  );

  useEffect(() => {
    if (!shouldPrefetchPhotos) return;

    photos.forEach((photo) => {
      if (typeof photo === 'string' && !failedPhotos.current.has(photo)) {
        void Image.prefetch(photo);
      }
    });
  }, [photos, shouldPrefetchPhotos]);

  return (
    <FlatList
      data={photos}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      keyExtractor={(_, i) => String(i)}
      renderItem={renderPhoto}
      getItemLayout={(_, index) => ({
        length: photoWidth,
        offset: photoWidth * index,
        index,
      })}
      initialNumToRender={1}
      maxToRenderPerBatch={shouldPrefetchPhotos ? 4 : 2}
      windowSize={shouldPrefetchPhotos ? 5 : 3}
    />
  );
});
