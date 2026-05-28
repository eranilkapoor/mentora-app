import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { matchListStyles } from '../MatchList.styles';

interface FilterItem {
  key: string;
  labelKey: string;
}

interface FilterSectionProps {
  titleKey: string;
  items: readonly FilterItem[];
  value?: string;
  onChange: (value: string) => void;
}

export function FilterSection({
  titleKey,
  items,
  value,
  onChange,
}: FilterSectionProps): React.ReactElement {
  const styles = useThemedStyles(matchListStyles);
  const { t } = useTranslation();

  return (
    <View style={styles.filterSectionContainer}>
      <Text style={styles.filterSectionTitle}>{t(titleKey)}</Text>
      <View style={styles.filterOptionsContainer}>
        {items.map((item) => {
          const selected = value === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.8}
              onPress={() => onChange(item.key)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[
                styles.filterOptionButton,
                selected && styles.filterOptionButtonSelected,
              ]}
            >
              <Text
                style={[
                  styles.filterOptionButtonText,
                  selected && styles.filterOptionButtonTextSelected,
                ]}
              >
                {t(item.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
