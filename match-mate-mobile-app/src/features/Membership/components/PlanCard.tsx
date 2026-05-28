import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { membershipStyles } from '../Membership.styles';
import { PlanCardProps } from '../Membership.types';

export const PlanCard = React.memo(function PlanCard({
  plan,
  active,
  onPress,
}: PlanCardProps): React.ReactElement {
  const styles = useThemedStyles(membershipStyles);
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={[styles.planCard, active && styles.planCardActive]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="radio"
      accessibilityState={{ checked: active }}
      accessibilityLabel={t('membership.plan_card_label', {
        months: plan.months,
        price: plan.price,
      })}
    >
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>
            {t('membership.popular_badge')}
          </Text>
        </View>
      )}
      <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
        {active && <View style={styles.radioInner} />}
      </View>
      <Text style={[styles.planMonths, active && styles.planMonthsActive]}>
        {t('membership.months_label', { count: plan.months })}
      </Text>
      <Text style={[styles.planPrice, active && styles.planPriceActive]}>
        {plan.price}
      </Text>
      <Text style={styles.oldPrice}>{plan.oldPrice}</Text>
      <View style={styles.perMonthBadge}>
        <Text style={styles.perMonthText}>{plan.perMonth}</Text>
      </View>
    </TouchableOpacity>
  );
});
