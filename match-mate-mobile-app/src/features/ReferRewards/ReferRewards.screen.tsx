import React, { useMemo } from 'react';
import {
  Linking,
  Platform,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import Header from '@/core/components/Header';
import Loader from '@/core/components/Loader';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { showError, showSuccess } from '@/core/utils/toast';
import { useGetReferralSummaryQuery } from '@/store/services/referralApi.service';
import { SettingsNavigationProp } from '@/navigation/types';
import { referRewardsStyles } from './ReferRewards.styles';
import { ReferredUser } from './ReferRewards.types';

type Props = {
  navigation: SettingsNavigationProp;
};

const formatDate = (value?: string): string => {
  if (!value) return 'Joined recently';
  return new Date(value).toLocaleDateString();
};

function copyToClipboard(value: string): Promise<boolean> {
  if (Platform.OS === 'web' && globalThis.navigator?.clipboard) {
    return globalThis.navigator.clipboard
      .writeText(value)
      .then(() => true)
      .catch(() => false);
  }

  return Promise.resolve(false);
}

function RewardRow({
  item,
  isLast,
}: {
  item: ReferredUser;
  isLast?: boolean;
}): React.ReactElement {
  const styles = useThemedStyles(referRewardsStyles);
  const initial = item.name.trim().charAt(0).toUpperCase() || 'M';

  return (
    <View style={[styles.rewardRow, isLast && styles.rewardRowLast]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.pointsText}>+{item.totalPoints} pts</Text>
        </View>
        <Text style={styles.rowMeta}>
          {formatDate(item.joinedAt)}
          {item.email ? ` • ${item.email}` : ''}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.status.replace(/_/g, ' ')}</Text>
        </View>
      </View>
    </View>
  );
}

export default function ReferRewardsScreen({
  navigation,
}: Props): React.ReactElement {
  const styles = useThemedStyles(referRewardsStyles);
  const { theme } = useTheme();
  const { data, isLoading, refetch } = useGetReferralSummaryQuery();
  const summary = data?.data;

  const message = useMemo(() => {
    const code = summary?.referralCode ?? '';
    return `Join Match Mate with my referral code ${code} and complete your registration.`;
  }, [summary?.referralCode]);

  const openShare = async (type: 'native' | 'sms' | 'email' | 'whatsapp') => {
    if (!summary?.referralCode) return;

    try {
      if (type === 'native') {
        await Share.share({ message });
        return;
      }

      const encoded = encodeURIComponent(message);
      const url =
        type === 'sms'
          ? `sms:?body=${encoded}`
          : type === 'email'
            ? `mailto:?subject=${encodeURIComponent('Join Match Mate')}&body=${encoded}`
            : `whatsapp://send?text=${encoded}`;

      const supported = await Linking.canOpenURL(url);
      if (!supported && type === 'whatsapp') {
        await Share.share({ message });
        return;
      }
      await Linking.openURL(url);
    } catch {
      showError({
        title: 'Sharing failed',
        message: 'Unable to open this option right now.',
      });
    }
  };

  const handleCopy = async () => {
    if (!summary?.referralCode) return;
    const copied = await copyToClipboard(summary.referralCode);
    if (copied) {
      showSuccess({ title: 'Referral code copied' });
      return;
    }
    await Share.share({ message: summary.referralCode });
  };

  if (isLoading && !summary) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        title="Refer & Rewards"
        showBack
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>Rewards wallet</Text>
          <Text style={styles.title}>{summary?.totalPoints ?? 0} points</Text>
          <Text style={styles.subtitle}>
            Earn points when friends join with your code. Subscription rewards
            are added automatically after successful payments.
          </Text>

          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>Your referral code</Text>
            <View style={styles.codeRow}>
              <Text style={styles.codeText}>
                {summary?.referralCode ?? '------'}
              </Text>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => {
                  void handleCopy();
                }}
                accessibilityRole="button"
                accessibilityLabel="Copy referral code"
              >
                <Feather name="copy" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.metricStrip}>
            <View style={styles.metricTile}>
              <Text style={styles.metricValue}>
                {summary?.redeemablePoints ?? 0}
              </Text>
              <Text style={styles.metricLabel}>Redeemable</Text>
            </View>
            <View style={styles.metricTile}>
              <Text style={styles.metricValue}>
                {summary?.redemptionThreshold ?? 1000}
              </Text>
              <Text style={styles.metricLabel}>Threshold</Text>
            </View>
            <View style={styles.metricTile}>
              <Text style={styles.metricValue}>
                {Math.round((summary?.subscriptionRewardRate ?? 0.05) * 100)}%
              </Text>
              <Text style={styles.metricLabel}>Plan bonus</Text>
            </View>
          </View>

          <View style={styles.shareRow}>
            {[
              ['send', 'Share', 'native'],
              ['message-circle', 'SMS', 'sms'],
              ['mail', 'Email', 'email'],
              ['message-square', 'WhatsApp', 'whatsapp'],
            ].map(([icon, label, type]) => (
              <TouchableOpacity
                key={type}
                style={styles.shareButton}
                onPress={() => {
                  void openShare(
                    type as 'native' | 'sms' | 'email' | 'whatsapp'
                  );
                }}
                accessibilityRole="button"
              >
                <Feather
                  name={icon as React.ComponentProps<typeof Feather>['name']}
                  size={14}
                  color={theme.colors.textSecondary}
                />
                <Text style={styles.shareButtonText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <SettingsCard
          title="Referred users"
          subtitle="Track registrations and subscription bonuses from your network."
        >
          {summary?.referredUsers?.length ? (
            summary.referredUsers.map((item, index) => (
              <RewardRow
                key={item.userId}
                item={item}
                isLast={index === summary.referredUsers.length - 1}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>
              No referrals yet. Share your code to start earning rewards.
            </Text>
          )}
        </SettingsCard>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => {
            void refetch();
          }}
          accessibilityRole="button"
        >
          <Feather
            name="refresh-cw"
            size={14}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.shareButtonText}>Refresh rewards</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
