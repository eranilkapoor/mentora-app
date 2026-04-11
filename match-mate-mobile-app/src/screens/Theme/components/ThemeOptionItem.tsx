import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '@/core/constants/colors';
import { ThemeOption } from '../Theme.types';
import { ThemeMode } from '@/store/slices/settingsSlice';

interface Styles {
  optionRow: StyleProp<ViewStyle>;
  optionRowLast: StyleProp<ViewStyle>;
  optionRowActive: StyleProp<ViewStyle>;
  optionLeft: StyleProp<ViewStyle>;
  optionIconWrapper: StyleProp<ViewStyle>;
  optionIconWrapperActive: StyleProp<ViewStyle>;
  optionLabel: StyleProp<TextStyle>;
  optionLabelActive: StyleProp<TextStyle>;
  optionDescription: StyleProp<TextStyle>;
  checkBadge: StyleProp<ViewStyle>;
  checkBadgeEmpty: StyleProp<ViewStyle>;
}

interface Props {
  item: ThemeOption;
  isActive: boolean;
  isLast: boolean;
  styles: Styles;
  onPress: (code: ThemeMode) => void;
}

const ThemeOptionItemComponent = ({
  item,
  isActive,
  isLast,
  styles,
  onPress,
}: Props): React.ReactElement => {
  const handlePress = useCallback(() => {
    onPress(item.code);
  }, [item.code, onPress]);

  return (
    <TouchableOpacity
      style={[
        styles.optionRow,
        isLast && styles.optionRowLast,
        isActive && styles.optionRowActive,
      ]}
      onPress={handlePress}
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

export const ThemeOptionItem = memo(ThemeOptionItemComponent);
