import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { PlanCardProps } from '../Membership.types';
import { membershipStyles } from '../Membership.styles';
import { TouchableOpacity, View, Text } from 'react-native';

export function PlanCard({
  plan,
  active,
  onPress,
}: PlanCardProps): React.ReactElement {
  const styles = useThemedStyles(membershipStyles);
  return (
    <TouchableOpacity
      style={[styles.planCard, active && styles.planCardActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {plan.months === 6 && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>Popular</Text>
        </View>
      )}
      <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
        {active && <View style={styles.radioInner} />}
      </View>
      <Text style={[styles.planMonths, active && styles.planMonthsActive]}>
        {plan.months} months
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
}
