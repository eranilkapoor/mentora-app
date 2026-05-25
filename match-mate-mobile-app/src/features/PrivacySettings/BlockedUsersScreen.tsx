import React, { useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/core/components/Header';
import Loader from '@/core/components/Loader';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { SettingsSelectItem } from '@/core/components/settings/SettingsSelectItem';
import { showConfirm } from '@/core/utils/confirm';
import { showError, showSuccess } from '@/core/utils/toast';
import { SettingsNavigationProp } from '@/navigation/types';
import {
  useGetBlockedUsersQuery,
  useUnblockUserMutation,
} from '@/store/services/privacySettings.service';
import { sharedSettingsStyles } from '../Settings/shared.settings.styles';
import { useThemedStyles } from '@/core/theme/useThemedStyles';

type Props = {
  navigation: SettingsNavigationProp;
};

export default function BlockedUsersScreen({
  navigation,
}: Props): React.ReactElement {
  const styles = useThemedStyles(sharedSettingsStyles);
  const { data, isLoading } = useGetBlockedUsersQuery();
  const [unblockUser] = useUnblockUserMutation();

  const handleUnblock = useCallback(
    (targetUserId: string) => {
      showConfirm({
        title: 'Unblock user?',
        message:
          'They may be able to view or contact you depending on your privacy settings.',
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
            blockedUsers.map((targetUserId, index) => (
              <SettingsSelectItem
                key={targetUserId}
                icon="user-x"
                label={`User ${targetUserId.slice(-6)}`}
                sublabel={targetUserId}
                value="Unblock"
                isLast={index === blockedUsers.length - 1}
                onPress={() => handleUnblock(targetUserId)}
              />
            ))
          )}
        </SettingsCard>
        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}
