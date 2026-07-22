import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { membershipStyles } from '../Membership.styles';
import { FeatureRow } from './FeatureRow';
import {
  DisplayFeatureRow,
  DisplayPlan,
  MembershipBillingCycle,
} from '../Membership.types';
import { SELF_TRUST_BADGES } from '../Membership.constants';
import { formatPlanName } from '../Membership.utils';

interface Props {
  displayPlans: DisplayPlan[];
  featureRows: DisplayFeatureRow[];
  selectedPlan: string;
  selectedIndex: number;
  onSelectPlan: (planId: string) => void;
  billingCycles: MembershipBillingCycle[];
  selectedBillingCycle: MembershipBillingCycle;
  onSelectBillingCycle: (cycle: MembershipBillingCycle) => void;
}

export function SelfServiceTab({
  displayPlans,
  featureRows,
  selectedPlan,
  selectedIndex,
  onSelectPlan,
  billingCycles,
  selectedBillingCycle,
  onSelectBillingCycle,
}: Props): React.ReactElement {
  const styles = useThemedStyles(membershipStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const selected = displayPlans[selectedIndex] ?? displayPlans[0];

  return (
    <>
      {/* Refund banner */}
      <View style={styles.refundBanner}>
        <Text style={styles.refundIcon}>🔁</Text>
        <View>
          <Text style={styles.refundText}>
            {t('membership.refund_guarantee')}
          </Text>
          <Text style={styles.refundSub}>{t('membership.refund_terms')}</Text>
        </View>
      </View>

      <View style={styles.cycleSection}>
        <View style={styles.cycleHeader}>
          <View>
            <Text style={styles.cycleTitle}>
              {t('membership.billing_cycle_title')}
            </Text>
            <Text style={styles.cycleSubtitle}>
              {t('membership.billing_cycle_subtitle')}
            </Text>
          </View>
          <Feather name="calendar" size={17} color={theme.colors.primary} />
        </View>
        <View style={styles.cycleSelector} accessibilityRole="tablist">
          {billingCycles.map((cycle) => {
            const active = selectedBillingCycle === cycle;
            return (
              <TouchableOpacity
                key={cycle}
                style={[styles.cycleOption, active && styles.cycleOptionActive]}
                activeOpacity={0.8}
                onPress={() => onSelectBillingCycle(cycle)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                <Text
                  style={[
                    styles.cycleOptionText,
                    active && styles.cycleOptionTextActive,
                  ]}
                >
                  {t(`membership.billing_cycle.${cycle}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.planSectionHeader}>
        <Text style={styles.planSectionTitle}>
          {t('membership.choose_tier_title')}
        </Text>
        <Text style={styles.planSectionMeta}>
          {t('membership.three_tiers_available')}
        </Text>
      </View>

      {/* Exactly one Silver, Gold, and Platinum plan for the selected cycle. */}
      <View style={styles.planRowThree}>
        {displayPlans.map((plan) => {
          const active = selectedPlan === plan.id;
          return (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                styles.planCardCompact,
                active && styles.planCardActive,
                plan.purchaseState === 'current' && styles.planCardCurrent,
              ]}
              onPress={() => {
                if (plan.id) onSelectPlan(plan.id);
              }}
              activeOpacity={0.85}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              accessibilityLabel={t('membership.select_plan_label', {
                name: plan.name,
                price: plan.price,
              })}
            >
              {plan.best && plan.purchaseState !== 'current' && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>
                    {t('membership.popular_badge')}
                  </Text>
                </View>
              )}
              {plan.purchaseState === 'current' && (
                <View style={styles.currentPlanBadge}>
                  <Text style={styles.currentPlanBadgeText}>
                    {t('membership.current_plan_badge')}
                  </Text>
                </View>
              )}
              <Text style={[styles.planName, active && styles.planNameActive]}>
                {plan.tier ? formatPlanName(plan.tier) : plan.name}
              </Text>
              <Text
                style={[styles.planPrice, active && styles.planPriceActive]}
              >
                {plan.price}
              </Text>
              <Text style={styles.planDuration}>{plan.durationLabel}</Text>
              {plan.trialLabel ? (
                <Text style={styles.planMetaLabel}>{plan.trialLabel}</Text>
              ) : null}
              {plan.renewalLabel ? (
                <Text style={styles.planMetaMuted}>{plan.renewalLabel}</Text>
              ) : null}
              {plan.purchaseState && plan.purchaseState !== 'new' ? (
                <Text style={styles.planStateText}>
                  {t(`membership.plan_state.${plan.purchaseState}`)}
                </Text>
              ) : null}
              <View
                style={[styles.radioOuter, active && styles.radioOuterActive]}
              >
                {active && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Feature comparison table */}
      <View style={styles.featureTableCard}>
        <View style={styles.featureTableHeader}>
          <Text style={styles.featureHeaderLabel}>
            {t('membership.features_header')}
          </Text>
          <View style={styles.featureValues}>
            <Text
              style={[styles.featureHeaderCol, styles.featureHeaderColActive]}
              numberOfLines={1}
            >
              {selected?.name ?? ''}
            </Text>
          </View>
        </View>

        {featureRows.map((f, index) => (
          <FeatureRow
            key={f.key}
            label={f.label}
            values={[f.values[selectedIndex] ?? '0']}
            selectedIndex={0}
            isLast={index === featureRows.length - 1}
          />
        ))}
      </View>

      {/* Trust badges */}
      <View style={styles.trustRow}>
        {SELF_TRUST_BADGES.map((badge) => (
          <View key={badge.labelKey} style={styles.trustBadge}>
            <Feather name={badge.icon} size={13} color={theme.colors.primary} />
            <Text style={styles.trustText}>{t(badge.labelKey)}</Text>
          </View>
        ))}
      </View>
    </>
  );
}
