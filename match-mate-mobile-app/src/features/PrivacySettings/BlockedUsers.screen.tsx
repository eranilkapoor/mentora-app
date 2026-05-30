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
import Header from '@/core/components/Header';
import Loader from '@/core/components/Loader';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { SettingsSelectItem } from '@/core/components/settings/SettingsSelectItem';
import { useTheme } from '@/core/theme/ThemeProvider';
import { Theme } from '@/core/theme/types';
import { resolveApiUrl } from '@/core/utils/config';
import { showConfirm } from '@/core/utils/confirm';
import { showError, showSuccess } from '@/core/utils/toast';
import { SettingsNavigationProp } from '@/navigation/types';
import {
  useGetBlockedUsersQuery,
  useUnblockUserMutation,
} from '@/store/services/privacySettings.service';
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
  const styles = useThemedStyles(sharedSettingsStyles);
  const { theme } = useTheme();
  const localStyles = React.useMemo(() => createStyles(theme), [theme]);
  const { data, isLoading } = useGetBlockedUsersQuery();
  const [unblockUser] = useUnblockUserMutation();

  const handleUnblock = useCallback(
    (targetUserId: string, name: string) => {
      showConfirm({
        title: 'Unblock user?',
        message: `${name} may be able to view or contact you depending on your privacy settings.`,
        confirmText: 'Unblock',
        onConfirm: () => {
          void unblockUser({ targetUserId })
            .unwrap()
            .then(() => {
              showSuccess({ title: 'User unblocked' });
            })
            .catch((error: unknown) => {
              console.error('Unblock failed:', error);
              showError({
                title: 'Unable to unblock',
                message: 'Please try again.',
              });
            });
        },
      });
    },
    [unblockUser]
  );

  const renderBlockedUser = useCallback(
    (user: BlockedUserSummary, index: number) => {
      const resolvedAvatar = user.avatarUrl
        ? resolveApiUrl(user.avatarUrl)
        : null;
      const avatarUrl = resolvedAvatar ?? FALLBACK_AVATAR;
      const meta = [user.age ? `${user.age} yrs` : undefined, user.location]
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
              {meta || 'Blocked profile'}
            </Text>
          </View>
          <TouchableOpacity
            style={localStyles.unblockButton}
            onPress={() => handleUnblock(user.userId, user.name)}
            accessibilityRole="button"
            accessibilityLabel={`Unblock ${user.name}`}
          >
            <Feather name="unlock" size={13} color={theme.colors.error} />
            <Text style={localStyles.unblockText}>Unblock</Text>
          </TouchableOpacity>
        </View>
      );
    },
    [
      data?.blockedUsers.length,
      handleUnblock,
      localStyles,
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
      <Header showBack onBackPress={navigation.goBack} title="Blocked Users" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SettingsCard
          icon="slash"
          title="Blocked Users"
          subtitle="Manage people you have blocked"
        >
          {blockedUsers.length === 0 ? (
            <SettingsSelectItem
              icon="check-circle"
              label="No blocked users"
              sublabel="Profiles you block will appear here."
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
