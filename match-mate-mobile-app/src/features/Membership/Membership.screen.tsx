import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../core/components/Header';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { membershipStyles } from './Membership.styles';
import {
  BENEFITS,
  DURATION_PLANS,
  FEATURES,
  PLANS,
  POINTS,
} from './Membership.constants';
import { FeatureRow } from './components/FeatureRow';
import { PlanCard } from './components/PlanCard';
import { useTheme } from '@/core/theme/ThemeProvider';
import {
  MembershipPlan,
  useCreateMembershipOrderMutation,
  useGetActiveSubscriptionQuery,
  useGetMembershipPlansQuery,
} from '@/store/services/membershipApi.service';

type DisplayPlan = {
  id?: string;
  name: string;
  price: string;
  durationLabel: string;
  best?: boolean;
  source?: MembershipPlan;
};

const formatPlanName = (name: string): string =>
  name
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

const formatPlanPrice = (plan: MembershipPlan): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: plan.currency || 'INR',
    maximumFractionDigits: 0,
  }).format(plan.price);

const getDurationLabel = (durationDays: number): string => {
  if (durationDays >= 365) return '/ year';
  if (durationDays >= 90) return '/ 3 months';
  if (durationDays >= 30) return '/ month';
  return `/${durationDays} days`;
};

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function MembershipScreen(): React.ReactElement {
  const styles = useThemedStyles(membershipStyles);
  const { theme } = useTheme();
  const [tab, setTab] = useState<'self' | 'assisted'>('self');
  const [duration, setDuration] = useState<number>(6);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const { data: backendPlans = [], isFetching: isFetchingPlans } =
    useGetMembershipPlansQuery();
  const { data: activeSubscription } = useGetActiveSubscriptionQuery();
  const [createOrder, { isLoading: isCreatingOrder }] =
    useCreateMembershipOrderMutation();

  const displayPlans = useMemo<DisplayPlan[]>(() => {
    const paidPlans = backendPlans
      .filter((plan) => plan.price > 0)
      .slice(0, 3)
      .map((plan) => ({
        id: plan._id,
        name: formatPlanName(plan.name),
        price: formatPlanPrice(plan),
        durationLabel: getDurationLabel(plan.durationDays),
        best: Boolean(plan.isPopular),
        source: plan,
      }));

    if (paidPlans.length > 0) {
      return paidPlans;
    }

    return PLANS.map((plan) => ({
      name: plan.name,
      price: plan.price,
      durationLabel: '/ 3 months',
      best: Boolean(plan.best),
    }));
  }, [backendPlans]);

  useEffect(() => {
    if (selectedPlan || displayPlans.length === 0) {
      return;
    }

    setSelectedPlan(
      displayPlans.find((plan) => plan.best)?.name ?? displayPlans[0].name
    );
  }, [displayPlans, selectedPlan]);

  const selectedPlanItem =
    displayPlans.find((plan) => plan.name === selectedPlan) ??
    displayPlans[0] ??
    null;
  const selectedIndex = Math.max(
    0,
    displayPlans.findIndex((plan) => plan.name === selectedPlan)
  );
  const activePlanName =
    typeof activeSubscription?.planId === 'object'
      ? formatPlanName(activeSubscription.planId.name)
      : undefined;

  const handleCreateOrder = async (): Promise<void> => {
    if (!selectedPlanItem?.source?._id) {
      Alert.alert(
        'Plans unavailable',
        'Please try again after membership plans finish loading.'
      );
      return;
    }

    try {
      const order = await createOrder({
        planId: selectedPlanItem.source._id,
        currency: selectedPlanItem.source.currency,
        idempotencyKey: `${selectedPlanItem.source._id}-${Date.now()}`,
        description: `${selectedPlanItem.name} membership`,
      }).unwrap();

      Alert.alert(
        'Payment order created',
        `Order ${order.orderId} is ready for ${order.currency} ${order.netAmount}.`
      );
    } catch {
      Alert.alert(
        'Payment failed',
        'We could not start your payment. Please try again.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Go Premium" subtitle="Unlock exclusive features" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Card ────────────────────────────────────────────── */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Feather name="star" size={11} color={theme.colors.white} />
            <Text style={styles.heroBadgeText}>PREMIUM MEMBERSHIP</Text>
          </View>
          <Text style={styles.heroTitle}>Find Your Perfect Match</Text>
          <Text style={styles.heroSubtitle}>
            {activePlanName
              ? `Current plan: ${activePlanName}`
              : 'Unlock premium features and connect with serious profiles faster.'}
          </Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>10M+</Text>
              <Text style={styles.heroStatLabel}>Members</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>3×</Text>
              <Text style={styles.heroStatLabel}>Faster Matches</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>92%</Text>
              <Text style={styles.heroStatLabel}>Success Rate</Text>
            </View>
          </View>
        </View>

        {/* ── Tabs ─────────────────────────────────────────────────── */}
        <View style={styles.tabs}>
          {(['self', 'assisted'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.activeTab]}
              onPress={() => setTab(t)}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === t }}
            >
              <Feather
                name={t === 'self' ? 'user' : 'users'}
                size={14}
                color={
                  tab === t ? theme.colors.primary : theme.colors.textMuted
                }
              />
              <Text style={[styles.tabText, tab === t && styles.activeTabText]}>
                {t === 'self' ? 'Self-Service' : 'Assisted'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'self' ? (
          <>
            {/* Refund banner */}
            <View style={styles.refundBanner}>
              <Text style={styles.refundIcon}>🔁</Text>
              <View>
                <Text style={styles.refundText}>
                  30-day full refund guarantee
                </Text>
                <Text style={styles.refundSub}>*Terms & conditions apply</Text>
              </View>
            </View>

            {/* Plan cards */}
            <View style={styles.planRow}>
              {displayPlans.map((plan) => {
                const active = selectedPlan === plan.name;
                return (
                  <TouchableOpacity
                    key={plan.name}
                    style={[styles.planCard, active && styles.planCardActive]}
                    onPress={() => setSelectedPlan(plan.name)}
                    activeOpacity={0.85}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: active }}
                  >
                    {plan.best && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularBadgeText}>⭐ Top</Text>
                      </View>
                    )}
                    <Text
                      style={[styles.planName, active && styles.planNameActive]}
                    >
                      {plan.name}
                    </Text>
                    <Text
                      style={[
                        styles.planPrice,
                        active && styles.planPriceActive,
                      ]}
                    >
                      {plan.price}
                    </Text>
                    <Text style={styles.planDuration}>
                      {plan.durationLabel}
                    </Text>
                    <View
                      style={[
                        styles.radioOuter,
                        active && styles.radioOuterActive,
                      ]}
                    >
                      {active && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Feature table */}
            <View style={styles.featureTableCard}>
              {/* Header */}
              <View style={styles.featureTableHeader}>
                <Text style={styles.featureHeaderLabel}>Features</Text>
                <View style={styles.featureValues}>
                  {displayPlans.map((p, i) => (
                    <Text
                      key={p.name}
                      style={[
                        styles.featureHeaderCol,
                        i === selectedIndex && styles.featureHeaderColActive,
                      ]}
                      numberOfLines={1}
                    >
                      {p.name.replace('Pro ', '')}
                    </Text>
                  ))}
                </View>
              </View>

              {/* Rows */}
              {FEATURES.map((f, index) => (
                <FeatureRow
                  key={f.label}
                  label={f.label}
                  values={f.values}
                  selectedIndex={selectedIndex}
                  isLast={index === FEATURES.length - 1}
                />
              ))}
            </View>

            {/* Trust badges */}
            <View style={styles.trustRow}>
              {['🔒 Secure', '✅ Verified', '💬 24/7 Support'].map((badge) => (
                <View key={badge} style={styles.trustBadge}>
                  <Text style={styles.trustText}>{badge}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Exclusive label */}
            <View style={styles.sectionLabelRow}>
              <View style={styles.exclusivePill}>
                <Text style={styles.exclusivePillText}>✦ EXCLUSIVE</Text>
              </View>
              <View style={styles.dividerLine} />
            </View>

            {/* Benefits card */}
            <View style={styles.card}>
              <View style={styles.cardTopAccent} />
              {BENEFITS.map((b) => (
                <View key={b.text} style={styles.benefitRow}>
                  <Text style={styles.benefitIcon}>{b.icon}</Text>
                  <Text style={styles.benefitText}>{b.text}</Text>
                </View>
              ))}
              <View style={styles.divider} />
              <View style={styles.pointsContainer}>
                {POINTS.map((p) => (
                  <View key={p} style={styles.pointRow}>
                    <View style={styles.pointDot} />
                    <Text style={styles.pointText}>{p}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.callbackBtn}
                  activeOpacity={0.85}
                >
                  <Text style={styles.callbackText}>📞 Request Call Back</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.knowMoreText}>Know more ›</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Offer banner */}
            <View style={styles.offerBanner}>
              <Text style={styles.offerEmoji}>🎉</Text>
              <Text style={styles.offerText}>FLAT 50% OFF ON ALL PLANS</Text>
              <Text style={styles.offerEmoji}>🎉</Text>
            </View>

            {/* Duration plans */}
            <View style={styles.planRow}>
              {DURATION_PLANS.map((plan) => (
                <PlanCard
                  key={plan.months}
                  plan={plan}
                  active={duration === plan.months}
                  onPress={() => setDuration(plan.months)}
                />
              ))}
            </View>

            {/* Savings callout */}
            <View style={styles.savingsRow}>
              <Text style={styles.savingsText}>
                💡 Save more with longer plans — up to{' '}
                <Text style={styles.savingsHighlight}>₹42,372</Text> saved on 12
                months
              </Text>
            </View>

            {/* Trust badges */}
            <View style={styles.trustRow}>
              {['🔒 Secure', '✅ Verified', '🏆 10M+ Members'].map((badge) => (
                <View key={badge} style={styles.trustBadge}>
                  <Text style={styles.trustText}>{badge}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* ── Sticky CTA ───────────────────────────────────────────────── */}
      {tab === 'self' ? (
        <View style={styles.ctaContainer}>
          <View style={styles.ctaInfo}>
            <Text style={styles.ctaPlan}>{selectedPlanItem?.name}</Text>
            <Text style={styles.ctaPrice}>{selectedPlanItem?.price}</Text>
          </View>
          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.85}
            disabled={isCreatingOrder || isFetchingPlans}
            onPress={() => {
              void handleCreateOrder();
            }}
          >
            {isCreatingOrder || isFetchingPlans ? (
              <ActivityIndicator size="small" color={theme.colors.white} />
            ) : (
              <Text style={styles.ctaButtonText}>
                Get {selectedPlanItem?.name} →
              </Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.ctaContainer}>
          <View style={styles.ctaInfo}>
            <Text style={styles.ctaPlan}>Selected Plan</Text>
            <Text style={styles.ctaPrice}>
              {DURATION_PLANS.find((p) => p.months === duration)?.price}
            </Text>
            <Text style={styles.ctaDuration}>{duration} months</Text>
          </View>
          <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85}>
            <Text style={styles.ctaButtonText}>Get Exclusive Now →</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
