import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import Feather from 'react-native-vector-icons/Feather';
import Header from '@/core/components/Header';
import Loader from '@/core/components/Loader';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { SettingsSelectItem } from '@/core/components/settings/SettingsSelectItem';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { AppNavigationProp, SettingsNavigationProp } from '@/navigation/types';
import {
  ActiveSubscription,
  BillingPayment,
  MembershipPlan,
  useGetBillingSummaryQuery,
} from '@/store/services/membershipApi.service';
import { subscriptionBillingStyles } from './SubscriptionBilling.styles';
import { useTheme } from '@/core/theme/ThemeProvider';

type Props = {
  navigation: SettingsNavigationProp;
};

const formatDate = (
  value?: string | null,
  fallback = 'Not available'
): string => {
  if (!value) return fallback;

  return new Date(value).toLocaleDateString();
};

const formatAmount = (amount: number, currency = 'INR'): string =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

const getPlanName = (
  plan?: MembershipPlan | string,
  fallback = 'Free plan',
  stringFallback = 'Membership plan'
): string => {
  if (!plan) return fallback;
  if (typeof plan === 'string') return stringFallback;

  return plan.name;
};

const getPlanFeatures = (
  plan?: MembershipPlan | string
): MembershipPlan['features'] => {
  if (!plan || typeof plan === 'string') return [];

  return plan.features ?? [];
};

function StatusBadge({
  status,
  success,
}: {
  status: string;
  success?: boolean;
}): React.ReactElement {
  const styles = useThemedStyles(subscriptionBillingStyles);

  return (
    <View style={[styles.badge, success && styles.successBadge]}>
      <Text style={[styles.badgeText, success && styles.successBadgeText]}>
        {status.replace(/_/g, ' ')}
      </Text>
    </View>
  );
}

function SubscriptionRow({
  item,
  isLast,
}: {
  item: ActiveSubscription;
  isLast: boolean;
}): React.ReactElement {
  const styles = useThemedStyles(subscriptionBillingStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <View style={styles.rowIcon}>
        <Feather name="award" size={16} color={theme.colors.primary} />
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowHeader}>
          <Text style={styles.rowTitle}>{getPlanName(item.planId)}</Text>
          <StatusBadge
            status={item.status}
            success={item.status === 'active'}
          />
        </View>
        <Text style={styles.rowMeta}>
          {formatDate(item.startDate, t('common.not_available'))} -{' '}
          {formatDate(item.endDate, t('common.not_available'))}
        </Text>
        <View style={styles.rowFooter}>
          <View style={styles.smallPill}>
            <Text style={styles.smallPillText}>
              {t('membership.billing.auto_renew_state', {
                state: item.autoRenew ? t('common.on') : t('common.off'),
              })}
            </Text>
          </View>
          {item.cancelledAt ? (
            <View style={styles.smallPill}>
              <Text style={styles.smallPillText}>
                {t('membership.billing.cancelled_on', {
                  date: formatDate(item.cancelledAt, t('common.not_available')),
                })}
              </Text>
            </View>
          ) : null}
        </View>
        {item.cancelledReason ? (
          <Text style={styles.rowMeta}>
            {t('membership.billing.reason', { reason: item.cancelledReason })}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function PaymentRow({
  item,
  isLast,
}: {
  item: BillingPayment;
  isLast: boolean;
}): React.ReactElement {
  const styles = useThemedStyles(subscriptionBillingStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const paid = item.status === 'success';

  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <View style={styles.rowIcon}>
        <Feather
          name={paid ? 'check-circle' : 'credit-card'}
          size={16}
          color={paid ? theme.colors.success : theme.colors.primary}
        />
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowHeader}>
          <Text style={styles.rowTitle}>
            {formatAmount(item.netAmount, item.currency)}
          </Text>
          <StatusBadge status={item.status} success={paid} />
        </View>
        <Text style={styles.rowMeta}>
          {t('membership.billing.payment_via', {
            plan: getPlanName(
              item.planId,
              t('membership.billing.free_plan'),
              t('membership.billing.membership_plan')
            ),
            gateway: item.gateway,
          })}
          {item.method ? ` (${item.method})` : ''}
        </Text>
        <Text style={styles.rowMeta}>
          {formatDate(
            item.paidAt ?? item.failedAt ?? item.initiatedAt,
            t('common.not_available')
          )}
        </Text>
        <View style={styles.rowFooter}>
          <View style={styles.smallPill}>
            <Text style={styles.smallPillText}>
              {t('membership.billing.order_id', { id: item.orderId })}
            </Text>
          </View>
          <View style={styles.smallPill}>
            <Text style={styles.smallPillText}>{item.purpose}</Text>
          </View>
        </View>
        {item.failureReason ? (
          <Text style={styles.rowMeta}>{item.failureReason}</Text>
        ) : null}
      </View>
    </View>
  );
}

function BenefitRow({
  feature,
  isLast,
}: {
  feature: NonNullable<MembershipPlan['features']>[number];
  isLast: boolean;
}): React.ReactElement {
  const styles = useThemedStyles(subscriptionBillingStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const title =
    feature.featureId?.name ??
    feature.featureId?.key ??
    t('membership.billing.plan_benefit');
  const value =
    typeof feature.value === 'boolean'
      ? feature.value
        ? t('membership.billing.included')
        : t('membership.billing.not_included')
      : feature.value !== undefined
        ? String(feature.value)
        : feature.featureId?.description;

  return (
    <View style={[styles.benefitRow, isLast && styles.benefitRowLast]}>
      <View style={styles.benefitIcon}>
        <Feather name="check" size={15} color={theme.colors.success} />
      </View>
      <View style={styles.benefitContent}>
        <Text style={styles.benefitTitle}>{title}</Text>
        {value ? <Text style={styles.benefitSubtitle}>{value}</Text> : null}
      </View>
    </View>
  );
}

export default function SubscriptionBillingScreen({
  navigation,
}: Props): React.ReactElement {
  const styles = useThemedStyles(subscriptionBillingStyles);
  const { t } = useTranslation();
  const appNavigation = useNavigation<AppNavigationProp>();
  const { data, isLoading, refetch } = useGetBillingSummaryQuery();

  const currentPlanName = useMemo(
    () =>
      getPlanName(
        data?.currentPlan?.planId,
        t('membership.billing.free_plan'),
        t('membership.billing.membership_plan')
      ),
    [data?.currentPlan?.planId, t]
  );
  const currentPlanFeatures = useMemo(
    () => getPlanFeatures(data?.currentPlan?.planId) ?? [],
    [data?.currentPlan?.planId]
  );
  const currentStatus = data?.currentPlan?.status ?? 'free';

  if (isLoading || !data) {
    return <Loader fullScreen size="large" />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('membership.billing.title')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.planLabel}>
                {t('membership.billing.current_membership')}
              </Text>
              <Text style={styles.planTitle}>{currentPlanName}</Text>
              <Text style={styles.planSubtitle}>
                {data.currentPlan
                  ? t('membership.billing.valid_until', {
                      date: formatDate(
                        data.currentPlan.endDate,
                        t('common.not_available')
                      ),
                    })
                  : t('membership.billing.upgrade_hint')}
              </Text>
            </View>
            <StatusBadge
              status={currentStatus}
              success={currentStatus === 'active'}
            />
          </View>

          <View style={styles.metricStrip}>
            <View style={styles.metricTile}>
              <Text style={styles.metricLabel}>
                {t('membership.billing.total_paid')}
              </Text>
              <Text style={styles.metricValue}>
                {formatAmount(data.billing.totalPaid, data.billing.currency)}
              </Text>
            </View>
            <View style={styles.metricTile}>
              <Text style={styles.metricLabel}>
                {t('membership.billing.payments')}
              </Text>
              <Text style={styles.metricValue}>
                {data.billing.successfulPayments}
              </Text>
            </View>
            <View style={styles.metricTile}>
              <Text style={styles.metricLabel}>
                {t('membership.billing.auto_renew')}
              </Text>
              <Text style={styles.metricValue}>
                {data.billing.autoRenew ? t('common.on') : t('common.off')}
              </Text>
            </View>
          </View>
        </View>

        <SettingsCard
          icon="credit-card"
          title={t('membership.billing.plan_details')}
          subtitle={t('membership.billing.plan_details_sub')}
        >
          <View style={styles.summaryGrid}>
            <View style={styles.summaryTile}>
              <Text style={styles.label}>{t('membership.billing.plan')}</Text>
              <Text style={styles.value}>{currentPlanName}</Text>
            </View>
            <View style={styles.summaryTile}>
              <Text style={styles.label}>{t('membership.billing.status')}</Text>
              <Text style={styles.value}>
                {data.currentPlan?.status ?? 'free'}
              </Text>
            </View>
            <View style={styles.summaryTile}>
              <Text style={styles.label}>
                {t('membership.billing.valid_until_label')}
              </Text>
              <Text style={styles.value}>
                {formatDate(
                  data.currentPlan?.endDate,
                  t('common.not_available')
                )}
              </Text>
            </View>
            <View style={styles.summaryTile}>
              <Text style={styles.label}>
                {t('membership.billing.auto_renew')}
              </Text>
              <Text style={styles.value}>
                {data.billing.autoRenew ? t('common.on') : t('common.off')}
              </Text>
            </View>
          </View>
          <SettingsSelectItem
            icon="zap"
            label={t('membership.billing.manage_membership')}
            sublabel={t('membership.billing.manage_membership_sub')}
            onPress={() =>
              appNavigation.navigate('Tabs', { screen: 'Membership' })
            }
            isLast
          />
        </SettingsCard>

        <SettingsCard
          icon="award"
          title={t('membership.billing.plan_benefits')}
          subtitle={t('membership.billing.plan_benefits_sub')}
        >
          {currentPlanFeatures.length ? (
            currentPlanFeatures.map((feature, index) => (
              <BenefitRow
                key={`${feature.featureId?.key ?? feature.featureId?.name ?? index}`}
                feature={feature}
                isLast={index === currentPlanFeatures.length - 1}
              />
            ))
          ) : (
            <>
              <BenefitRow
                feature={{
                  value: t('membership.billing.basic_profile_access_sub'),
                  featureId: {
                    name: t('membership.billing.basic_profile_access'),
                  },
                }}
                isLast={false}
              />
              <BenefitRow
                feature={{
                  value: t('membership.billing.premium_features_sub'),
                  featureId: { name: t('membership.billing.premium_features') },
                }}
                isLast
              />
            </>
          )}
        </SettingsCard>

        <SettingsCard
          icon="file-text"
          title={t('membership.billing.billing_summary')}
          subtitle={t('membership.billing.billing_summary_sub')}
        >
          <View style={styles.summaryGrid}>
            <View style={styles.summaryTile}>
              <Text style={styles.label}>
                {t('membership.billing.total_paid')}
              </Text>
              <Text style={styles.value}>
                {formatAmount(data.billing.totalPaid, data.billing.currency)}
              </Text>
            </View>
            <View style={styles.summaryTile}>
              <Text style={styles.label}>
                {t('membership.billing.successful_payments')}
              </Text>
              <Text style={styles.value}>
                {data.billing.successfulPayments}
              </Text>
            </View>
            <View style={styles.summaryTile}>
              <Text style={styles.label}>
                {t('membership.billing.last_payment')}
              </Text>
              <Text style={styles.value}>
                {formatDate(
                  data.billing.lastPaymentAt,
                  t('common.not_available')
                )}
              </Text>
            </View>
            <View style={styles.summaryTile}>
              <Text style={styles.label}>
                {t('membership.billing.next_renewal')}
              </Text>
              <Text style={styles.value}>
                {formatDate(
                  data.billing.nextRenewalAt,
                  t('common.not_available')
                )}
              </Text>
            </View>
          </View>
          <SettingsSelectItem
            icon="refresh-cw"
            label={t('membership.billing.refresh_billing')}
            sublabel={t('membership.billing.refresh_billing_sub')}
            onPress={() => void refetch()}
            isLast
          />
        </SettingsCard>

        <SettingsCard
          icon="clock"
          title={t('membership.billing.previous_plans')}
          subtitle={t('membership.billing.previous_plans_sub')}
        >
          {data.subscriptions.length ? (
            data.subscriptions.map((subscription, index) => (
              <SubscriptionRow
                key={subscription._id}
                item={subscription}
                isLast={index === data.subscriptions.length - 1}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>
              {t('membership.billing.no_membership_history')}
            </Text>
          )}
        </SettingsCard>

        <SettingsCard
          icon="dollar-sign"
          title={t('membership.billing.billing_details')}
          subtitle={t('membership.billing.billing_details_sub')}
        >
          {data.payments.length ? (
            data.payments.map((payment, index) => (
              <PaymentRow
                key={payment._id}
                item={payment}
                isLast={index === data.payments.length - 1}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>
              {t('membership.billing.no_billing_records')}
            </Text>
          )}
        </SettingsCard>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}
