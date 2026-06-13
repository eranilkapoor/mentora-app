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
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { showError, showSuccess } from '@/core/utils/toast';
import { useGetReferralSummaryQuery } from '@/store/services/referralApi.service';
import { useGetWalletSummaryQuery } from '@/store/services/walletApi.service';
import { SettingsNavigationProp } from '@/navigation/types';
import { referRewardsStyles } from './ReferRewards.styles';
import { ReferredUser } from './ReferRewards.types';
import { TFunction } from 'i18next';

type Props = {
  navigation: SettingsNavigationProp;
};

const formatDate = (value: string | undefined, t: TFunction): string => {
  if (!value) return t('settings.referrals.joined_recently');
  return new Date(value).toLocaleDateString();
};

async function copyToClipboard(value: string): Promise<boolean> {
  if (Platform.OS === 'web' && globalThis.navigator?.clipboard) {
    try {
      await globalThis.navigator.clipboard.writeText(value);
      return true;
    } catch {
      return false;
    }
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
  const { t } = useTranslation();
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
          <Text style={styles.pointsText}>
            {t('settings.referrals.points_short', {
              count: item.totalPoints,
            })}
          </Text>
        </View>
        <Text style={styles.rowMeta}>
          {formatDate(item.joinedAt, t)}
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
  const { data: walletData } = useGetWalletSummaryQuery();
  const summary = data?.data;
  const wallet = walletData?.data;

  const { t } = useTranslation();

  const message = useMemo(() => {
    const code = summary?.referralCode ?? '';
    return t('settings.referrals.share_message', { code });
  }, [summary?.referralCode, t]);

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
            ? `mailto:?subject=${encodeURIComponent(t('settings.referrals.share_subject'))}&body=${encoded}`
            : `whatsapp://send?text=${encoded}`;

      const supported = await Linking.canOpenURL(url);
      if (!supported && type === 'whatsapp') {
        await Share.share({ message });
        return;
      }
      await Linking.openURL(url);
    } catch {
      showError({
        title: t('settings.referrals.sharing_failed_title'),
        message: t('settings.referrals.sharing_failed_message'),
      });
    }
  };

  const handleCopy = async () => {
    if (!summary?.referralCode) return;
    const copied = await copyToClipboard(summary.referralCode);
    if (copied) {
      showSuccess({
        title: t('settings.referrals.copy_referral_code_success'),
      });
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
        title={t('settings.referrals.title')}
        showBack
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>
            {t('settings.referrals.rewards_wallet')}
          </Text>
          <Text style={styles.title}>
            {t('settings.referrals.points', {
              count: summary?.totalPoints ?? 0,
            })}
          </Text>
          <Text style={styles.subtitle}>
            {t('settings.referrals.earn_points')}
          </Text>

          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>
              {t('settings.referrals.your_referral_code')}
            </Text>
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
                accessibilityLabel={t('settings.referrals.copy_referral_code')}
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
              <Text style={styles.metricLabel}>
                {t('settings.referrals.redeemable')}
              </Text>
            </View>
            <View style={styles.metricTile}>
              <Text style={styles.metricValue}>
                {summary?.redemptionThreshold ?? 1000}
              </Text>
              <Text style={styles.metricLabel}>
                {t('settings.referrals.threshold')}
              </Text>
            </View>
            <View style={styles.metricTile}>
              <Text style={styles.metricValue}>
                {Math.round((summary?.subscriptionRewardRate ?? 0.05) * 100)}%
              </Text>
              <Text style={styles.metricLabel}>
                {t('settings.referrals.plan_bonus')}
              </Text>
            </View>
          </View>

          <View style={styles.shareRow}>
            {[
              ['send', t('settings.referrals.share_option_native'), 'native'],
              [
                'message-circle',
                t('settings.referrals.share_option_sms'),
                'sms',
              ],
              ['mail', t('settings.referrals.share_option_email'), 'email'],
              [
                'message-square',
                t('settings.referrals.share_option_whatsapp'),
                'whatsapp',
              ],
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
          title={t('settings.referrals.coins_wallet', {
            defaultValue: 'Coins wallet',
          })}
          subtitle={t('settings.referrals.coins_wallet_sub', {
            defaultValue: 'Use credits for boosts, premium actions and add-ons',
          })}
        >
          <View style={styles.walletSummaryRow}>
            <View style={styles.walletBalanceTile}>
              <Text style={styles.walletBalanceValue}>
                {wallet?.balance ?? summary?.totalPoints ?? 0}
              </Text>
              <Text style={styles.walletBalanceLabel}>
                {t('settings.referrals.available_coins', {
                  defaultValue: 'Available coins',
                })}
              </Text>
            </View>
            <View style={styles.walletBalanceTile}>
              <Text style={styles.walletBalanceValue}>
                {wallet?.transactions?.length ?? 0}
              </Text>
              <Text style={styles.walletBalanceLabel}>
                {t('settings.referrals.wallet_activity', {
                  defaultValue: 'Recent activity',
                })}
              </Text>
            </View>
          </View>
        </SettingsCard>

        <SettingsCard
          title={t('settings.referrals.referred_users')}
          subtitle={t('settings.referrals.referred_users_sub')}
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
              {t('settings.referrals.no_referrals')}
            </Text>
          )}
        </SettingsCard>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => {
            void refetch();
          }}
          accessibilityRole="button"
          accessibilityLabel={t('settings.referrals.refresh_rewards')}
        >
          <Feather
            name="refresh-cw"
            size={14}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.shareButtonText}>
            {t('settings.referrals.refresh_rewards')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
