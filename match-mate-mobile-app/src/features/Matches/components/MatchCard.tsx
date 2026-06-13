import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { matchListStyles } from '../MatchList.styles';
import { MatchItem } from '../MatchList.types';

interface Props {
  item: MatchItem;
  onViewProfile: () => void;
  onPrimaryAction: () => void;
  onRejectRequest: () => void;
  onDismissCurated: () => void;
  onShortlist: () => void;
}

export const MatchCard = React.memo(function MatchCard({
  item,
  onViewProfile,
  onPrimaryAction,
  onRejectRequest,
  onDismissCurated,
  onShortlist,
}: Props): React.ReactElement {
  const styles = useThemedStyles(matchListStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const primaryIcon: React.ComponentProps<typeof Feather>['name'] =
    item.requestStatus
      ? 'check'
      : item.isMatched
        ? 'message-circle'
        : item.isInterestPending
          ? 'x-circle'
          : 'heart';

  const primaryLabel = item.requestStatus
    ? t('matches.action_accept')
    : item.isMatched
      ? t('matches.action_chat')
      : item.isInterestPending
        ? t('matches.action_withdraw')
        : t('matches.action_interest');

  const primaryState: 'default' | 'pending' | 'success' | 'accept' =
    item.requestStatus
      ? 'accept'
      : item.isMatched
        ? 'success'
        : item.isInterestPending
          ? 'pending'
          : 'default';

  return (
    <View style={styles.card}>
      {/* ── Photo ─────────────────────────────────────────────────── */}
      <View style={styles.photoWrapper}>
        <Image
          source={{ uri: item.avatarUrl }}
          style={styles.photo}
          resizeMode="cover"
          accessibilityLabel={t('matches.photo_label', { name: item.name })}
        />
        <View style={styles.photoScrim} />

        <View style={styles.badgeRow}>
          {item.curationId && (
            <View style={styles.curatedBadge}>
              <Feather name="award" size={11} color={theme.colors.white} />
              <Text style={styles.curatedBadgeText}>
                {t('matches.badge_curated')}
              </Text>
            </View>
          )}
          {item.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>
                {t('matches.badge_new').toUpperCase()}
              </Text>
            </View>
          )}
          {item.isOnline && (
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineBadgeText}>
                {t('matches.badge_online')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.nameOverlay}>
          <Text style={styles.nameOverlayText} numberOfLines={1}>
            {item.name}
            {item.age ? `, ${item.age}` : ''}
          </Text>
          <View style={styles.locationOverlayRow}>
            <Feather name="map-pin" size={12} color="rgba(255,255,255,0.9)" />
            <Text style={styles.locationOverlayText}>{item.location}</Text>
          </View>
        </View>
      </View>

      {/* ── Info ──────────────────────────────────────────────────── */}
      <View style={styles.info}>
        <View style={styles.tagsRow}>
          {[item.height, item.religion, item.caste].map((tag, i) => (
            <View key={`${tag}-${i}`} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather name="book" size={13} color={theme.colors.textMuted} />
            <Text style={styles.metaText} numberOfLines={1}>
              {item.education}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Feather
              name="briefcase"
              size={13}
              color={theme.colors.textMuted}
            />
            <Text style={styles.metaText} numberOfLines={1}>
              {item.profession}
            </Text>
          </View>
        </View>

        {item.curationNote ? (
          <View style={styles.curatorNote}>
            <Feather name="award" size={13} color={theme.colors.primary} />
            <Text style={styles.curatorNoteText} numberOfLines={2}>
              {item.curationNote}
            </Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={onViewProfile}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t('matches.view_profile_label', {
              name: item.name,
            })}
          >
            <Feather name="user" size={14} color={theme.colors.primary} />
            <Text style={styles.outlineText}>
              {t('matches.action_profile')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.primaryBtn,
              primaryState === 'pending' && styles.primaryBtnPending,
              primaryState === 'success' && styles.primaryBtnSuccess,
              primaryState === 'accept' && styles.primaryBtnAccept,
            ]}
            onPress={onPrimaryAction}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <Feather name={primaryIcon} size={14} color={theme.colors.white} />
            <Text style={styles.primaryText}>{primaryLabel}</Text>
          </TouchableOpacity>

          {item.requestStatus ? (
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={onRejectRequest}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t('matches.reject_request')}
            >
              <Feather name="x" size={14} color={theme.colors.error} />
              <Text style={styles.rejectText}>
                {t('matches.reject_request')}
              </Text>
            </TouchableOpacity>
          ) : item.curationId ? (
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={onDismissCurated}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={t('matches.action_dismiss')}
            >
              <Feather name="x" size={14} color={theme.colors.error} />
              <Text style={styles.rejectText}>
                {t('matches.action_dismiss')}
              </Text>
            </TouchableOpacity>
          ) : (
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
                  ? t('matches.remove_shortlist_label', { name: item.name })
                  : t('matches.shortlist_label', { name: item.name })
              }
            >
              <Feather
                name="bookmark"
                size={16}
                color={
                  item.isShortlisted ? theme.colors.white : theme.colors.accent
                }
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
});
