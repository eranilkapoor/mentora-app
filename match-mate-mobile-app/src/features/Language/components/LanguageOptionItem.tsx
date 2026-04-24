import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
  StyleSheet,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';
import { LanguageOption } from '../Language.types';
import { Language } from '../../../store/slices/settingsSlice';

type Styles = {
  optionRow: StyleProp<ViewStyle>;
  optionRowLast: StyleProp<ViewStyle>;
  optionRowActive: StyleProp<ViewStyle>;
  optionLeft: StyleProp<ViewStyle>;
  optionIconWrapper: StyleProp<ViewStyle>;
  optionIconWrapperActive: StyleProp<ViewStyle>;
  optionLabel: StyleProp<TextStyle>;
  optionLabelActive: StyleProp<TextStyle>;
  optionNativeName: StyleProp<TextStyle>;
  checkBadge: StyleProp<ViewStyle>;
  checkBadgeEmpty: StyleProp<ViewStyle>;
};

interface Props {
  item: LanguageOption;
  isActive: boolean;
  isLast: boolean;
  styles: Styles;
  onPress: (code: Language) => void;
}

export const LanguageOptionItem = React.memo(
  ({ item, isActive, isLast, styles, onPress }: Props): React.ReactElement => {
    const { theme } = useTheme();

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
        activeOpacity={0.7}
        accessibilityRole="radio"
        accessibilityState={{ checked: isActive }}
        accessibilityLabel={item.label}
        accessibilityHint="Select language"
      >
        <View style={styles.optionLeft}>
          <View
            style={[
              styles.optionIconWrapper,
              isActive && styles.optionIconWrapperActive,
            ]}
          >
            <Text style={localStyles.icon}>{item.icon}</Text>
          </View>

          <View>
            <Text
              style={[styles.optionLabel, isActive && styles.optionLabelActive]}
            >
              {item.label}
            </Text>

            <Text style={styles.optionNativeName}>{item.nativeName}</Text>
          </View>
        </View>

        {isActive ? (
          <View style={styles.checkBadge}>
            <Feather name="check" size={13} color={theme.colors.white} />
          </View>
        ) : (
          <View style={styles.checkBadgeEmpty} />
        )}
      </TouchableOpacity>
    );
  }
);

LanguageOptionItem.displayName = 'LanguageOptionItem';

const localStyles = StyleSheet.create({
  icon: {
    fontSize: 18,
  },
});
