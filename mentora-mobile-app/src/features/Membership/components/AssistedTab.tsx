import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { membershipStyles } from '../Membership.styles';
import { FeatureRow } from './FeatureRow';
import { DisplayFeatureRow, DisplayPlan } from '../Membership.types';
import {
  ASSISTED_TRUST_BADGES,
  CUSTOM_ASSISTED_TRUST_BADGES,
} from '../Membership.constants';
import { CustomAssistedPlanDetails } from './CustomAssistedPlanDetails';

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
  const trustBadges = selected?.isCustom
    ? CUSTOM_ASSISTED_TRUST_BADGES
    : ASSISTED_TRUST_BADGES;

  return (
    <>
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
              {plan.best && plan.purchaseState !== 'current' ? (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>
                    {t('membership.popular_badge')}
                  </Text>
                </View>
              ) : null}
              {plan.purchaseState === 'current' ? (
                <View style={styles.currentPlanBadge}>
                  <Text style={styles.currentPlanBadgeText}>
                    {t('membership.current_plan_badge')}
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
              {plan.purchaseState && plan.purchaseState !== 'new' ? (
                <Text style={styles.planStateText}>
                  {t(`membership.plan_state.${plan.purchaseState}`)}
                </Text>
              ) : null}
              <View
                style={[styles.radioOuter, active && styles.radioOuterActive]}
              >
                {active ? <View style={styles.radioInner} /> : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.sectionLabelRow}>
        <View style={styles.exclusivePill}>
          <Text style={styles.exclusivePillText}>
            {t('membership.exclusive_label').toUpperCase()}
          </Text>
        </View>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.assistedSummary}>
        <View style={styles.assistedSummaryIcon}>
          <Feather
            name={selected?.isCustom ? 'sliders' : 'award'}
            size={18}
            color={theme.colors.primary}
          />
        </View>
        <View style={styles.assistedSummaryCopy}>
          <Text style={styles.assistedSummaryTitle}>
            {selected?.name ?? t('membership.tab_assisted')}
          </Text>
          <Text style={styles.assistedSummaryDescription}>
            {selected?.description ?? t('membership.screen_subtitle')}
          </Text>
        </View>
      </View>

      {selected?.isCustom ? (
        <CustomAssistedPlanDetails
          featureRows={featureRows}
          selectedIndex={selectedIndex}
        />
      ) : (
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
      )}

      <View style={styles.trustRow}>
        {trustBadges.map((badge) => (
          <View key={badge.labelKey} style={styles.trustBadge}>
            <Feather name={badge.icon} size={13} color={theme.colors.primary} />
            <Text style={styles.trustText}>{t(badge.labelKey)}</Text>
          </View>
        ))}
      </View>
    </>
  );
}
