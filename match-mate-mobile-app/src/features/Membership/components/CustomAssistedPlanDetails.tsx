import React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { membershipStyles } from '../Membership.styles';
import { DisplayFeatureRow } from '../Membership.types';
import { FeatureRow } from './FeatureRow';

interface Props {
  featureRows: DisplayFeatureRow[];
  selectedIndex: number;
}

export function CustomAssistedPlanDetails({
  featureRows,
  selectedIndex,
}: Props): React.ReactElement {
  const styles = useThemedStyles(membershipStyles);
  const { t } = useTranslation();

  return (
    <View style={styles.featureTableCard}>
      <View style={styles.featureTableHeader}>
        <Text style={styles.featureHeaderLabel}>
          {t('membership.custom_scope_title')}
        </Text>
        <View style={styles.featureValues}>
          <Text
            style={[styles.featureHeaderCol, styles.featureHeaderColActive]}
          >
            {t('membership.custom_value')}
          </Text>
        </View>
      </View>
      {featureRows.map((feature, index) => (
        <FeatureRow
          key={feature.key}
          label={feature.label}
          values={[
            feature.values[selectedIndex] ?? t('membership.custom_value'),
          ]}
          selectedIndex={0}
          isLast={index === featureRows.length - 1}
        />
      ))}
    </View>
  );
}
