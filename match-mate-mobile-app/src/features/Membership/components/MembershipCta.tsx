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

  return (
    <View style={styles.ctaContainer}>
      <View style={styles.ctaInfo}>
        <Text style={styles.ctaPlan}>{selectedPlanItem?.name ?? ''}</Text>
        <Text style={styles.ctaPrice}>{selectedPlanItem?.price ?? ''}</Text>
        <Text style={styles.ctaDuration}>
          {tab === 'assisted'
            ? t('membership.tab_assisted')
            : t('membership.tab_self')}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.ctaButton, isLoading && styles.ctaButtonDisabled]}
        activeOpacity={0.85}
        disabled={isLoading || !selectedPlanItem?.source?._id}
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
