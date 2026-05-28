import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { membershipStyles } from '../Membership.styles';
import { FeatureRow } from './FeatureRow';
import { DisplayPlan } from '../Membership.types';
import { FEATURES, SELF_TRUST_BADGES } from '../Membership.constants';

interface Props {
  displayPlans: DisplayPlan[];
  selectedPlan: string;
  selectedIndex: number;
  onSelectPlan: (name: string) => void;
}

export function SelfServiceTab({
  displayPlans,
  selectedPlan,
  selectedIndex,
  onSelectPlan,
}: Props): React.ReactElement {
  const styles = useThemedStyles(membershipStyles);
  const { t } = useTranslation();

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

      {/* Plan selector cards */}
      <View style={styles.planRow}>
        {displayPlans.map((plan) => {
          const active = selectedPlan === plan.name;
          return (
            <TouchableOpacity
              key={plan.name}
              style={[styles.planCard, active && styles.planCardActive]}
              onPress={() => onSelectPlan(plan.name)}
              activeOpacity={0.85}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              accessibilityLabel={t('membership.select_plan_label', {
                name: plan.name,
                price: plan.price,
              })}
            >
              {plan.best && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>
                    {t('membership.top_badge')}
                  </Text>
                </View>
              )}
              <Text style={[styles.planName, active && styles.planNameActive]}>
                {plan.name}
              </Text>
              <Text
                style={[styles.planPrice, active && styles.planPriceActive]}
              >
                {plan.price}
              </Text>
              <Text style={styles.planDuration}>{plan.durationLabel}</Text>
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

        {FEATURES.map((f, index) => (
          <FeatureRow
            key={f.labelKey}
            labelKey={f.labelKey}
            values={f.values}
            selectedIndex={selectedIndex}
            isLast={index === FEATURES.length - 1}
          />
        ))}
      </View>

      {/* Trust badges */}
      <View style={styles.trustRow}>
        {SELF_TRUST_BADGES.map((badge) => (
          <View key={badge.labelKey} style={styles.trustBadge}>
            <Text style={styles.trustText}>
              {badge.icon} {t(badge.labelKey)}
            </Text>
          </View>
        ))}
      </View>
    </>
  );
}
