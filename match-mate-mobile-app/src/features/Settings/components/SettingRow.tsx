import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { SettingRowProps } from '../Settings.types';
import { settingsStyles } from '../SettingsScreen.styles';
import { TouchableOpacity, View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '@/core/constants/colors';

export function SettingRow({
  icon,
  label,
  subLabel,
  badge,
  onPress,
  isLast,
}: SettingRowProps): React.ReactElement {
  const styles = useThemedStyles(settingsStyles);
  return (
    <TouchableOpacity
      style={[styles.row, isLast && styles.rowLast]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.rowLeft}>
        <View style={styles.rowIconWrapper}>
          <Feather name={icon} size={16} color={Colors.textSecondary} />
        </View>
        <View style={styles.rowLabelWrapper}>
          <Text style={styles.rowLabel}>{label}</Text>
          {subLabel !== undefined && (
            <Text style={styles.rowSubLabel}>{subLabel}</Text>
          )}
        </View>
      </View>
      {badge !== undefined && (
        <View style={styles.rowBadge}>
          <Text style={styles.rowBadgeText}>{badge}</Text>
        </View>
      )}
      <Feather name="chevron-right" size={16} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}
