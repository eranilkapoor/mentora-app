import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
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

const formatDate = (value?: string | null): string => {
  if (!value) return 'Not available';

  return new Date(value).toLocaleDateString();
};

const formatAmount = (amount: number, currency = 'INR'): string =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

const getPlanName = (plan?: MembershipPlan | string): string => {
  if (!plan) return 'Free plan';
  if (typeof plan === 'string') return 'Membership plan';

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
          {formatDate(item.startDate)} - {formatDate(item.endDate)}
        </Text>
        <View style={styles.rowFooter}>
          <View style={styles.smallPill}>
            <Text style={styles.smallPillText}>
              Auto renew {item.autoRenew ? 'on' : 'off'}
            </Text>
          </View>
          {item.cancelledAt ? (
            <View style={styles.smallPill}>
              <Text style={styles.smallPillText}>
                Cancelled {formatDate(item.cancelledAt)}
              </Text>
            </View>
          ) : null}
        </View>
        {item.cancelledReason ? (
          <Text style={styles.rowMeta}>Reason: {item.cancelledReason}</Text>
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
          {getPlanName(item.planId)} via {item.gateway}
          {item.method ? ` (${item.method})` : ''}
        </Text>
        <Text style={styles.rowMeta}>
          {formatDate(item.paidAt ?? item.failedAt ?? item.initiatedAt)}
        </Text>
        <View style={styles.rowFooter}>
          <View style={styles.smallPill}>
            <Text style={styles.smallPillText}>Order {item.orderId}</Text>
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
  const title =
    feature.featureId?.name ?? feature.featureId?.key ?? 'Plan benefit';
  const value =
    typeof feature.value === 'boolean'
      ? feature.value
        ? 'Included'
        : 'Not included'
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
  const appNavigation = useNavigation<AppNavigationProp>();
  const { data, isLoading, refetch } = useGetBillingSummaryQuery();

  const currentPlanName = useMemo(
    () => getPlanName(data?.currentPlan?.planId),
    [data?.currentPlan?.planId]
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
        title="Subscription & Billing"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.planLabel}>Current membership</Text>
              <Text style={styles.planTitle}>{currentPlanName}</Text>
              <Text style={styles.planSubtitle}>
                {data.currentPlan
                  ? `Valid until ${formatDate(data.currentPlan.endDate)}`
                  : 'Upgrade to unlock premium profile access'}
              </Text>
            </View>
            <StatusBadge
              status={currentStatus}
              success={currentStatus === 'active'}
            />
          </View>

          <View style={styles.metricStrip}>
            <View style={styles.metricTile}>
              <Text style={styles.metricLabel}>Total paid</Text>
              <Text style={styles.metricValue}>
                {formatAmount(data.billing.totalPaid, data.billing.currency)}
              </Text>
            </View>
            <View style={styles.metricTile}>
              <Text style={styles.metricLabel}>Payments</Text>
              <Text style={styles.metricValue}>
                {data.billing.successfulPayments}
              </Text>
            </View>
            <View style={styles.metricTile}>
              <Text style={styles.metricLabel}>Auto renew</Text>
              <Text style={styles.metricValue}>
                {data.billing.autoRenew ? 'On' : 'Off'}
              </Text>
            </View>
          </View>
        </View>

        <SettingsCard
          icon="credit-card"
          title="Plan Details"
          subtitle="Membership status and renewal settings"
        >
          <View style={styles.summaryGrid}>
            <View style={styles.summaryTile}>
              <Text style={styles.label}>Plan</Text>
              <Text style={styles.value}>{currentPlanName}</Text>
            </View>
            <View style={styles.summaryTile}>
              <Text style={styles.label}>Status</Text>
              <Text style={styles.value}>
                {data.currentPlan?.status ?? 'free'}
              </Text>
            </View>
            <View style={styles.summaryTile}>
              <Text style={styles.label}>Valid until</Text>
              <Text style={styles.value}>
                {formatDate(data.currentPlan?.endDate)}
              </Text>
            </View>
            <View style={styles.summaryTile}>
              <Text style={styles.label}>Auto renew</Text>
              <Text style={styles.value}>
                {data.billing.autoRenew ? 'On' : 'Off'}
              </Text>
            </View>
          </View>
          <SettingsSelectItem
            icon="zap"
            label="Manage Membership"
            sublabel="View available plans and upgrade options"
            onPress={() =>
              appNavigation.navigate('Tabs', { screen: 'Membership' })
            }
            isLast
          />
        </SettingsCard>

        <SettingsCard
          icon="award"
          title="Plan Benefits"
          subtitle="Premium access currently attached to your account"
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
                  value: 'Create and maintain your matrimonial profile',
                  featureId: { name: 'Basic profile access' },
                }}
                isLast={false}
              />
              <BenefitRow
                feature={{
                  value:
                    'Upgrade to unlock premium chat and visibility features',
                  featureId: { name: 'Premium features' },
                }}
                isLast
              />
            </>
          )}
        </SettingsCard>

        <SettingsCard
          icon="file-text"
          title="Billing Summary"
          subtitle="Payments completed from this account"
        >
          <View style={styles.summaryGrid}>
            <View style={styles.summaryTile}>
              <Text style={styles.label}>Total paid</Text>
              <Text style={styles.value}>
                {formatAmount(data.billing.totalPaid, data.billing.currency)}
              </Text>
            </View>
            <View style={styles.summaryTile}>
              <Text style={styles.label}>Successful payments</Text>
              <Text style={styles.value}>
                {data.billing.successfulPayments}
              </Text>
            </View>
            <View style={styles.summaryTile}>
              <Text style={styles.label}>Last payment</Text>
              <Text style={styles.value}>
                {formatDate(data.billing.lastPaymentAt)}
              </Text>
            </View>
            <View style={styles.summaryTile}>
              <Text style={styles.label}>Next renewal</Text>
              <Text style={styles.value}>
                {formatDate(data.billing.nextRenewalAt)}
              </Text>
            </View>
          </View>
          <SettingsSelectItem
            icon="refresh-cw"
            label="Refresh billing"
            sublabel="Pull the latest payment and plan details"
            onPress={() => void refetch()}
            isLast
          />
        </SettingsCard>

        <SettingsCard
          icon="clock"
          title="Previous Plans"
          subtitle="Membership plan history for this account"
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
            <Text style={styles.emptyText}>No membership history yet.</Text>
          )}
        </SettingsCard>

        <SettingsCard
          icon="dollar-sign"
          title="Billing Details"
          subtitle="Recent orders, invoices, and payment status"
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
            <Text style={styles.emptyText}>No billing records yet.</Text>
          )}
        </SettingsCard>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}
