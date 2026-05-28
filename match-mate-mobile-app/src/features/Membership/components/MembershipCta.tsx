import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { membershipStyles } from '../Membership.styles';
import { DisplayPlan, DurationPlan, MembershipTab } from '../Membership.types';
import { DURATION_PLANS } from '../Membership.constants';

interface Props {
  tab: MembershipTab;
  selectedPlanItem: DisplayPlan | null;
  duration: number;
  isCreatingOrder: boolean;
  isFetchingPlans: boolean;
  onCreateOrder: () => void;
  onGetExclusive: () => void;
}

export function MembershipCta({
  tab,
  selectedPlanItem,
  duration,
  isCreatingOrder,
  isFetchingPlans,
  onCreateOrder,
  onGetExclusive,
}: Props): React.ReactElement {
  const styles = useThemedStyles(membershipStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const activeDurationPlan: DurationPlan | undefined = DURATION_PLANS.find(
    (p) => p.months === duration
  );
  const isLoading = isCreatingOrder || isFetchingPlans;

  if (tab === 'self') {
    return (
      <View style={styles.ctaContainer}>
        <View style={styles.ctaInfo}>
          <Text style={styles.ctaPlan}>{selectedPlanItem?.name ?? ''}</Text>
          <Text style={styles.ctaPrice}>{selectedPlanItem?.price ?? ''}</Text>
        </View>
        <TouchableOpacity
          style={[styles.ctaButton, isLoading && styles.ctaButtonDisabled]}
          activeOpacity={0.85}
          disabled={isLoading}
          onPress={onCreateOrder}
          accessibilityRole="button"
          accessibilityLabel={t('membership.cta_get_plan', {
            name: selectedPlanItem?.name,
          })}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.colors.white} />
          ) : (
            <Text style={styles.ctaButtonText}>
              {t('membership.cta_get_plan', { name: selectedPlanItem?.name })}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.ctaContainer}>
      <View style={styles.ctaInfo}>
        <Text style={styles.ctaPlan}>{t('membership.cta_selected_plan')}</Text>
        <Text style={styles.ctaPrice}>{activeDurationPlan?.price ?? ''}</Text>
        <Text style={styles.ctaDuration}>
          {t('membership.months_label', { count: duration })}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.ctaButton}
        activeOpacity={0.85}
        onPress={onGetExclusive}
        accessibilityRole="button"
        accessibilityLabel={t('membership.cta_get_exclusive')}
      >
        <Text style={styles.ctaButtonText}>
          {t('membership.cta_get_exclusive')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
