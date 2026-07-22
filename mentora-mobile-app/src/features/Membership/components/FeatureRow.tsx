import React from 'react';
import { View, Text } from 'react-native';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { membershipStyles } from '../Membership.styles';
import { FeatureRowProps } from '../Membership.types';

export const FeatureRow = React.memo(function FeatureRow({
  label,
  values,
  selectedIndex,
  isLast = false,
}: FeatureRowProps): React.ReactElement {
  const styles = useThemedStyles(membershipStyles);

  return (
    <View style={[styles.featureRow, isLast && styles.featureRowLast]}>
      <Text style={styles.featureLabel}>{label}</Text>
      <View style={styles.featureValues}>
        {values.map((v, i) => (
          // Key includes value + index — values per row are positional, index is stable here
          <View
            key={`${v}-${i}`}
            style={[
              styles.featureCell,
              i === selectedIndex && styles.featureCellActive,
            ]}
          >
            <Text
              style={[
                styles.featureValue,
                v === '✓' && styles.featureCheck,
                v === '0' && styles.featureZero,
                i === selectedIndex && styles.featureValueActive,
              ]}
            >
              {v}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
});
