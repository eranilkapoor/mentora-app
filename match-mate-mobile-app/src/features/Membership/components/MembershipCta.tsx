import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { membershipStyles } from '../Membership.styles';
import { DisplayPlan, MembershipTab } from '../Membership.types';

interface Props {
  tab: MembershipTab;
  selectedPlanItem: DisplayPlan | null;
  isCreatingOrder: boolean;
  isFetchingPlans: boolean;
  onCreateOrder: () => void;
}

export function MembershipCta({
  tab,
  selectedPlanItem,
  isCreatingOrder,
  isFetchingPlans,
  onCreateOrder,
}: Props): React.ReactElement {
  const styles = useThemedStyles(membershipStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const isLoading = isCreatingOrder || isFetchingPlans;
  const isFreePlan = Boolean(selectedPlanItem?.isFree);
  const hasTrial = Boolean(selectedPlanItem?.source?.trialDays);
  const isCustomPlan = Boolean(selectedPlanItem?.isCustom);

  return (
    <View style={styles.ctaContainer}>
      <View style={styles.ctaInfo}>
        <Text style={styles.ctaPlan}>{selectedPlanItem?.name ?? ''}</Text>
        <Text style={styles.ctaPrice}>{selectedPlanItem?.price ?? ''}</Text>
        <Text style={styles.ctaDuration}>
          {selectedPlanItem?.trialLabel ??
            selectedPlanItem?.renewalLabel ??
            (tab === 'assisted'
              ? t('membership.tab_assisted')
              : tab === 'enterprise'
                ? t('membership.custom_terms')
                : t('membership.tab_self'))}
        </Text>
      </View>
      <TouchableOpacity
        style={[
          styles.ctaButton,
          (isLoading || isFreePlan) && styles.ctaButtonDisabled,
        ]}
        activeOpacity={0.85}
        disabled={isLoading || isFreePlan || !selectedPlanItem?.source?._id}
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
            {isCustomPlan
              ? t('membership.contact_sales')
              : isFreePlan
                ? t('membership.cta_current_plan')
                : hasTrial
                  ? t('membership.cta_start_trial', {
                      days: selectedPlanItem?.source?.trialDays,
                    })
                  : t('membership.cta_get_plan', {
                      name: selectedPlanItem?.name,
                    })}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
