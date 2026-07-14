import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { homeStyles } from '../Home.styles';
import { HomeMatchProfile } from '../Home.types';
import { PhotoCarousel } from './PhotoCarousel';

interface Props {
  item: HomeMatchProfile;
  onPrimaryAction: () => void;
  onView: () => void;
  onShortlist: () => void;
}

export const ProfileCard = React.memo(function ProfileCard({
  item,
  onPrimaryAction,
  onView,
  onShortlist,
}: Props): React.ReactElement {
  const styles = useThemedStyles(homeStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const primaryIcon: React.ComponentProps<typeof Feather>['name'] =
    item.isMatched
      ? 'message-circle'
      : item.isInterestPending
        ? 'x-circle'
        : 'heart';

  const primaryLabel = item.isMatched
    ? t('home.action_chat')
    : item.isInterestPending
      ? t('home.action_withdraw')
      : t('home.action_interest');

  return (
    <View style={styles.card}>
      <View style={styles.photoWrapper}>
        <PhotoCarousel
          photos={item.photos}
          name={item.name}
          shouldBlurPhotos={item.shouldBlurPhotos}
        />
        <View style={styles.photoScrim} pointerEvents="none" />

        {item.isOnline && (
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineBadgeText}>{t('home.badge_online')}</Text>
          </View>
        )}

        {item.isNew && (
          <View
            style={[
              styles.newBadge,
              item.isOnline ? styles.newBadgeOnline : styles.newBadgeDefault,
            ]}
          >
            <Text style={styles.newBadgeText}>
              {t('home.badge_new').toUpperCase()}
            </Text>
          </View>
        )}

        {item.photos.length > 1 && (
          <View style={styles.photoBadge}>
            <Feather name="image" size={11} color={theme.colors.white} />
            <Text style={styles.photoBadgeText}>{item.photos.length}</Text>
          </View>
        )}

        <View style={styles.photoOverlay}>
          <Text style={styles.heroName}>
            {item.name}
            {item.age ? `, ${item.age}` : ''}
          </Text>
          <View style={styles.heroLocationRow}>
            <Feather name="map-pin" size={12} color="rgba(255,255,255,0.9)" />
            <Text style={styles.heroLocation}>{item.location}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.tagsRow}>
          {[item.height, item.religion || '-', item.education].map(
            (tag, index) => (
              <View key={`${String(tag)}-${index}`} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            )
          )}
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather
              name="briefcase"
              size={13}
              color={theme.colors.textMuted}
            />
            <Text style={styles.meta}>{item.profession}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.viewBtn}
            onPress={onView}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t('home.view_profile_label', {
              name: item.name,
            })}
          >
            <Feather name="user" size={16} color={theme.colors.primary} />
            <Text style={styles.viewText}>{t('home.action_profile')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.chatBtn,
              item.isInterestPending && styles.chatBtnPending,
            ]}
            onPress={onPrimaryAction}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={
              item.isMatched
                ? t('home.chat_label', { name: item.name })
                : item.isInterestPending
                  ? t('home.withdraw_label', { name: item.name })
                  : t('home.interest_label', { name: item.name })
            }
          >
            <Feather name={primaryIcon} size={16} color={theme.colors.white} />
            <Text style={styles.chatText}>{primaryLabel}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.shortlistBtn,
              item.isShortlisted && styles.shortlistBtnActive,
            ]}
            onPress={onShortlist}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={
              item.isShortlisted
                ? t('home.remove_shortlist_label', { name: item.name })
                : t('home.shortlist_label', { name: item.name })
            }
          >
            <Feather
              name="bookmark"
              size={18}
              color={
                item.isShortlisted ? theme.colors.white : theme.colors.accent
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});
