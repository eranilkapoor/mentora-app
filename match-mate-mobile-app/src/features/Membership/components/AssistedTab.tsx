import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { membershipStyles } from '../Membership.styles';
import { FeatureRow } from './FeatureRow';
import { DisplayFeatureRow, DisplayPlan } from '../Membership.types';
import { ASSISTED_TRUST_BADGES } from '../Membership.constants';

interface Props {
  displayPlans: DisplayPlan[];
  featureRows: DisplayFeatureRow[];
  selectedPlan: string;
  selectedIndex: number;
  onSelectPlan: (planId: string) => void;
}

export function AssistedTab({
  displayPlans,
  featureRows,
  selectedPlan,
  selectedIndex,
  onSelectPlan,
}: Props): React.ReactElement {
  const styles = useThemedStyles(membershipStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const selected = displayPlans[selectedIndex] ?? displayPlans[0];

  return (
    <>
      <View style={styles.sectionLabelRow}>
        <View style={styles.exclusivePill}>
          <Text style={styles.exclusivePillText}>
            {t('membership.exclusive_label').toUpperCase()}
          </Text>
        </View>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.card}>
        <View style={styles.cardTopAccent} />
        <Text style={styles.assistedDescriptionText}>
          {selected?.description ?? t('membership.screen_subtitle')}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.planRow}
      >
        {displayPlans.map((plan) => {
          const active = selectedPlan === plan.id;

          return (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planCard, active && styles.planCardActive]}
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
              {plan.best ? (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>
                    {t('membership.top_badge')}
                  </Text>
                </View>
              ) : null}
              <Text style={[styles.planName, active && styles.planNameActive]}>
                {plan.name}
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
              <View
                style={[styles.radioOuter, active && styles.radioOuterActive]}
              >
                {active ? <View style={styles.radioInner} /> : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

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

        {featureRows.map((feature, index) => (
          <FeatureRow
            key={feature.key}
            label={feature.label}
            values={[feature.values[selectedIndex] ?? '0']}
            selectedIndex={0}
            isLast={index === featureRows.length - 1}
          />
        ))}
      </View>

      <View style={styles.trustRow}>
        {ASSISTED_TRUST_BADGES.map((badge) => (
          <View key={badge.labelKey} style={styles.trustBadge}>
            <Feather name={badge.icon} size={13} color={theme.colors.primary} />
            <Text style={styles.trustText}>{t(badge.labelKey)}</Text>
          </View>
        ))}
      </View>
    </>
  );
}
