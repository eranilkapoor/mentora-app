import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  ListRenderItem,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
  Text,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { matchDetailStyles } from '../MatchDetail.styles';
import { isWeb, windowWidth } from '@/core/utils/device';
import { DetailPhotoItem } from '../MatchDetail.utils';

interface Props {
  photos: DetailPhotoItem[];
  name: string;
}

export const DetailPhotoCarousel = React.memo(function DetailPhotoCarousel({
  photos,
  name,
}: Props): React.ReactElement {
  const styles = useThemedStyles(matchDetailStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  // Ref instead of state — error tracking without re-renders
  const failedPhotos = useRef<Set<string>>(new Set());

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>): void => {
      const width = isWeb ? 400 : windowWidth;
      const index = Math.round(e.nativeEvent.contentOffset.x / width);
      setActiveIndex(index);
    },
    []
  );

  const renderPhoto: ListRenderItem<DetailPhotoItem> = useCallback(
    ({ item }) => (
      <View style={styles.photoPrivacyFrame}>
        <Image
          source={{
            uri: failedPhotos.current.has(item.url) ? undefined : item.url,
          }}
          style={styles.photo}
          blurRadius={item.isBlurred ? 18 : 0}
          resizeMode="cover"
          accessibilityLabel={t('match_detail.photo_label', { name })}
          onError={() => {
            failedPhotos.current.add(item.url);
          }}
        />
        {item.isBlurred ? (
          <View style={styles.photoPrivacyOverlay}>
            <Feather name="lock" size={18} color={theme.colors.white} />
            <Text style={styles.photoPrivacyText}>
              Photo unlocks after match
            </Text>
          </View>
        ) : null}
      </View>
    ),
    [name, styles, t, theme.colors.white]
  );

  return (
    <>
      <FlatList
        data={photos}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        renderItem={renderPhoto}
        keyExtractor={(item, i) => `${item.url}-${i}`}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
      />

      {/* Counter pill */}
      <View style={styles.counterPill}>
        <Feather name="image" size={11} color={theme.colors.white} />
        <Text style={styles.counterText}>
          {activeIndex + 1} / {photos.length}
        </Text>
      </View>

      {/* Dot indicators */}
      {photos.length > 1 && (
        <View style={styles.dots}>
          {photos.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </>
  );
});
