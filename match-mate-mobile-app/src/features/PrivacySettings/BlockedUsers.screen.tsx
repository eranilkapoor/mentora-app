import React, { useCallback } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import Loader from '@/core/components/Loader';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { SettingsSelectItem } from '@/core/components/settings/SettingsSelectItem';
import { useTheme } from '@/core/theme/ThemeProvider';
import { applyAccessibilityToStyles } from '@/core/theme/accessibilityStyles';
import { Theme } from '@/core/theme/types';
import { resolveApiUrl } from '@/core/utils/config';
import { showConfirm } from '@/core/utils/confirm';
import { showError, showSuccess } from '@/core/utils/toast';
import { SettingsNavigationProp } from '@/navigation/types';
import {
  useGetBlockedUsersQuery,
  useUnblockUserMutation,
} from '@/store/services/privacySettingsApi.service';
import { sharedSettingsStyles } from '../Settings/shared.settings.styles';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { BlockedUserSummary } from './PrivacySettings.types';

type Props = {
  navigation: SettingsNavigationProp;
};

const FALLBACK_AVATAR = 'https://i.pravatar.cc/150?img=12';

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    userRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    userRowLast: {
      borderBottomWidth: 0,
    },
    avatar: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: theme.colors.backgroundLight,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
    },
    userInfo: {
      flex: 1,
      gap: 4,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    name: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      fontWeight: '700',
      flexShrink: 1,
    },
    meta: {
      color: theme.colors.textMuted,
      fontSize: 12,
    },
    unblockButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.error,
      backgroundColor: theme.colors.errorLight,
      minHeight: 36,
    },
    unblockText: {
      color: theme.colors.error,
      fontSize: 12,
      fontWeight: '800',
    },
  });

export default function BlockedUsersScreen({
  navigation,
}: Props): React.ReactElement {
  const { t } = useTranslation();
  const styles = useThemedStyles(sharedSettingsStyles);
  const { theme, fontScale, accessibility } = useTheme();
  const localStyles = React.useMemo(
    () =>
      applyAccessibilityToStyles(
        createStyles(theme),
        fontScale,
        accessibility.boldText
      ),
    [accessibility.boldText, fontScale, theme]
  );
  const { data, isLoading } = useGetBlockedUsersQuery();
  const [unblockUser] = useUnblockUserMutation();

  const handleUnblock = useCallback(
    (targetUserId: string, name: string) => {
      showConfirm({
        title: t('settings.blocked_users_screen.unblock_title'),
        message: t('settings.blocked_users_screen.unblock_message', { name }),
        confirmText: t('settings.blocked_users_screen.unblock'),
        onConfirm: () => {
          void unblockUser({ targetUserId })
            .unwrap()
            .then(() => {
              showSuccess({
                title: t('settings.blocked_users_screen.unblocked_title'),
              });
            })
            .catch((error: unknown) => {
              console.error('Unblock failed:', error);
              showError({
                title: t('settings.blocked_users_screen.unable_unblock_title'),
                message: t('common.try_again_message'),
              });
            });
        },
      });
    },
    [t, unblockUser]
  );

  const renderBlockedUser = useCallback(
    (user: BlockedUserSummary, index: number) => {
      const resolvedAvatar = user.avatarUrl
        ? resolveApiUrl(user.avatarUrl)
        : null;
      const avatarUrl = resolvedAvatar ?? FALLBACK_AVATAR;
      const meta = [
        user.age ? t('profile.age_years', { age: user.age }) : undefined,
        user.location,
      ]
        .filter(Boolean)
        .join(' • ');

      return (
        <View
          key={user.userId}
          style={[
            localStyles.userRow,
            index === (data?.blockedUsers.length ?? 0) - 1 &&
              localStyles.userRowLast,
          ]}
        >
          <Image source={{ uri: avatarUrl }} style={localStyles.avatar} />
          <View style={localStyles.userInfo}>
            <View style={localStyles.nameRow}>
              <Text style={localStyles.name} numberOfLines={1}>
                {user.name}
              </Text>
              {user.isVerified ? (
                <Feather
                  name="check-circle"
                  size={14}
                  color={theme.colors.success}
                />
              ) : null}
            </View>
            <Text style={localStyles.meta} numberOfLines={1}>
              {meta || t('settings.blocked_users_screen.blocked_profile')}
            </Text>
          </View>
          <TouchableOpacity
            style={localStyles.unblockButton}
            onPress={() => handleUnblock(user.userId, user.name)}
            accessibilityRole="button"
            accessibilityLabel={t(
              'settings.blocked_users_screen.unblock_user_label',
              { name: user.name }
            )}
          >
            <Feather name="unlock" size={13} color={theme.colors.error} />
            <Text style={localStyles.unblockText}>
              {t('settings.blocked_users_screen.unblock')}
            </Text>
          </TouchableOpacity>
        </View>
      );
    },
    [
      data?.blockedUsers.length,
      handleUnblock,
      localStyles,
      t,
      theme.colors.error,
      theme.colors.success,
    ]
  );

  if (isLoading || !data) {
    return <Loader fullScreen size="large" />;
  }

  const blockedUsers = data.blockedUsers ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('settings.blocked_users')}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SettingsCard
          icon="slash"
          title={t('settings.blocked_users')}
          subtitle={t('settings.blocked_users_sub')}
        >
          {blockedUsers.length === 0 ? (
            <SettingsSelectItem
              icon="check-circle"
              label={t('settings.blocked_users_screen.empty_title')}
              sublabel={t('settings.blocked_users_screen.empty_message')}
              disabled
              isLast
              onPress={() => undefined}
            />
          ) : (
            blockedUsers.map(renderBlockedUser)
          )}
        </SettingsCard>
        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}
