import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '@/core/constants/colors';
import { LanguageOption } from '../Language.types';
import { Language } from '../../../store/slices/settingsSlice';

interface Props {
  item: LanguageOption;
  isActive: boolean;
  isLast: boolean;
  styles: any;
  onPress: (code: Language) => void;
}

export const LanguageOptionItem = ({
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
          <Text style={{ fontSize: 18 }}>{item.icon}</Text>
        </View>

        <View>
          <Text
            style={[
              styles.optionLabel,
              isActive && styles.optionLabelActive,
            ]}
          >
            {item.label}
          </Text>
          <Text style={styles.optionNativeName}>
            {item.nativeName}
          </Text>
        </View>
      </View>

      {isActive ? (
        <View style={styles.checkBadge}>
          <Feather name="check" size={13} color={Colors.white} />
        </View>
      ) : (
        <View style={styles.checkBadgeEmpty} />
      )}
    </TouchableOpacity>
  );
};