import React, { useCallback, useMemo } from 'react';
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
  useCancelSubscriptionMutation,
  useGetBillingSummaryQuery,
  useGetMembershipPlansQuery,
} from '@/store/services/membershipApi.service';
import { subscriptionBillingStyles } from './SubscriptionBilling.styles';
import { useTheme } from '@/core/theme/ThemeProvider';
import { showConfirm } from '@/core/utils/confirm';
import { showError, showSuccess } from '@/core/utils/toast';
import { formatPlanName } from '@/features/Membership/Membership.utils';

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
): NonNullable<MembershipPlan['features']> => {
  if (!plan || typeof plan === 'string') return [];

  return plan.features ?? [];
};

const resolvePlan = (
  plan: MembershipPlan | string | undefined,
  plans: MembershipPlan[]
): MembershipPlan | undefined => {
  if (!plan) return undefined;
  if (typeof plan !== 'string') return plan;

  return plans.find((item) => item._id === plan || item.slug === plan);
};

const formatFeatureValue = (
  value: NonNullable<MembershipPlan['features']>[number]['value'],
  t: ReturnType<typeof useTranslation>['t']
): string | undefined => {
  if (typeof value === 'boolean') {
    return value
      ? t('membership.billing.included')
      : t('membership.billing.not_included');
  }

  if (value === -1) return t('membership.billing.unlimited');
  if (value === undefined || value === null || value === '') return undefined;

  return String(value);
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
    (feature.featureId?.key ? formatPlanName(feature.featureId.key) : null) ??
    t('membership.billing.plan_benefit');
  const value = formatFeatureValue(feature.value, t);
  const description = feature.featureId?.description;

  return (
    <View style={[styles.benefitRow, isLast && styles.benefitRowLast]}>
      <View style={styles.benefitIcon}>
        <Feather name="check" size={15} color={theme.colors.success} />
      </View>
      <View style={styles.benefitContent}>
        <Text style={styles.benefitTitle}>{title}</Text>
        {description ? (
          <Text style={styles.benefitSubtitle}>{description}</Text>
        ) : null}
        {value ? <Text style={styles.benefitValue}>{value}</Text> : null}
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
  const { data: plans = [] } = useGetMembershipPlansQuery();
  const [cancelSubscription, { isLoading: isCancellingRenewal }] =
    useCancelSubscriptionMutation();
  const resolvedCurrentPlan = useMemo(
    () => resolvePlan(data?.currentPlan?.planId, plans),
    [data?.currentPlan?.planId, plans]
  );

  const currentPlanName = useMemo(
    () =>
      getPlanName(
        resolvedCurrentPlan ?? data?.currentPlan?.planId,
        t('membership.billing.free_plan'),
        t('membership.billing.membership_plan')
      ),
    [data?.currentPlan?.planId, resolvedCurrentPlan, t]
  );
  const currentPlanFeatures = useMemo(
    () => getPlanFeatures(resolvedCurrentPlan ?? data?.currentPlan?.planId),
    [data?.currentPlan?.planId, resolvedCurrentPlan]
  );
  const currentStatus = data?.currentPlan?.status ?? 'free';
  const isTrialActive = Boolean(data?.currentPlan?.trialEndsAt);
  const paymentProvider =
    data?.currentPlan?.paymentProvider ??
    data?.payments.find((payment) => payment.status === 'success')?.gateway;

  const handleCancelRenewal = useCallback(() => {
    showConfirm({
      title: t('membership.billing.cancel_auto_renew'),
      message: t('membership.billing.cancel_auto_renew_confirm'),
      confirmText: t('membership.billing.cancel_auto_renew_confirm_cta'),
      destructive: true,
      onConfirm: async () => {
        try {
          await cancelSubscription({
            reason: 'user_requested_from_billing_screen',
          }).unwrap();
          showSuccess({
            title: t('membership.billing.cancel_auto_renew_success_title'),
            message: t('membership.billing.cancel_auto_renew_success_message'),
          });
          await refetch();
        } catch {
          showError({
            title: t('membership.billing.cancel_auto_renew_failed_title'),
            message: t('membership.billing.cancel_auto_renew_failed_message'),
          });
        }
      },
    });
  }, [cancelSubscription, refetch, t]);

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
                {t('membership.billing.billing_cycle')}
              </Text>
              <Text style={styles.value}>
                {resolvedCurrentPlan?.billingCycle ??
                  t('membership.billing.not_applicable')}
              </Text>
            </View>
            <View style={styles.summaryTile}>
              <Text style={styles.label}>
                {t('membership.billing.trial_status')}
              </Text>
              <Text style={styles.value}>
                {isTrialActive
                  ? t('membership.billing.trial_until', {
                      date: formatDate(
                        data.currentPlan?.trialEndsAt,
                        t('common.not_available')
                      ),
                    })
                  : t('membership.billing.no_active_trial')}
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
            <View style={styles.summaryTile}>
              <Text style={styles.label}>
                {t('membership.billing.payment_provider')}
              </Text>
              <Text style={styles.value}>
                {paymentProvider
                  ? String(paymentProvider).replace(/_/g, ' ')
                  : t('membership.billing.not_connected')}
              </Text>
            </View>
            <View style={styles.summaryTile}>
              <Text style={styles.label}>
                {t('membership.billing.reconciliation')}
              </Text>
              <Text style={styles.value}>
                {paymentProvider
                  ? t('membership.billing.provider_synced')
                  : t('membership.billing.provider_not_synced')}
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
            isLast={!data.billing.autoRenew}
          />
          {data.currentPlan && data.billing.autoRenew ? (
            <SettingsSelectItem
              icon="x-circle"
              label={t('membership.billing.cancel_auto_renew')}
              sublabel={t('membership.billing.cancel_auto_renew_sub')}
              destructive
              disabled={isCancellingRenewal}
              onPress={handleCancelRenewal}
              isLast
            />
          ) : null}
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
