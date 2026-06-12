import React, { useCallback, useRef } from 'react';
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
          accessibilityLabel={`Photo of ${name}`}
          onError={() => {
            failedPhotos.current.add(item);
          }}
        />
      );
    },
    [name, photoWidth, styles]
  );

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
    />
  );
});
