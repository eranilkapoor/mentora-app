import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '@/core/constants/colors';
import { ThemeOption } from '../Theme.types';

interface Props {
  item: ThemeOption;
  isActive: boolean;
  isLast: boolean;
  styles: any;
  onPress: (code: string) => void;
}

export const ThemeOptionItem = ({
  item,
  isActive,
  isLast,
  styles,
  onPress,
}: Props) => {
  return (
    <TouchableOpacity
      style={[
        styles.optionRow,
        isLast && styles.optionRowLast,
        isActive && styles.optionRowActive,
      ]}
      onPress={() => onPress(item.code)}
      accessibilityRole="radio"
      accessibilityState={{ checked: isActive }}
      accessibilityLabel={item.label}
    >
      <View style={styles.optionLeft}>
        <View
          style={[
            styles.optionIconWrapper,
            isActive && styles.optionIconWrapperActive,
          ]}
        >
          <Feather
            name={item.icon}
            size={16}
            color={isActive ? Colors.primary : Colors.textMuted}
          />
        </View>

        <View>
          <Text
            style={[styles.optionLabel, isActive && styles.optionLabelActive]}
          >
            {item.label}
          </Text>
          <Text style={styles.optionDescription}>{item.description}</Text>
        </View>
      </View>

      {isActive ? (
        <View style={styles.checkBadge}>
          <Feather name="check" size={13} color="#fff" />
        </View>
      ) : (
        <View style={styles.checkBadgeEmpty} />
      )}
    </TouchableOpacity>
  );
};
