import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { ToggleRowProps } from '../NotificationSettings.types';
import { notificationSettingsStyles } from '../NotificationSettingsScreen.styles';
import { Switch, View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '@/core/constants/colors';

export function ToggleRow({
  icon,
  label,
  description,
  value,
  onValueChange,
  disabled = false,
}: ToggleRowProps): React.ReactElement {
  const styles = useThemedStyles(notificationSettingsStyles);

  return (
    <View style={[styles.row, disabled && styles.rowDisabled]}>
      <View style={styles.rowIconWrapper}>
        <Feather
          name={icon}
          size={16}
          color={disabled ? Colors.textMuted : Colors.primary}
        />
      </View>
      <View style={styles.rowTextWrapper}>
        <Text style={[styles.rowLabel, disabled && styles.textDisabled]}>
          {label}
        </Text>
        <Text style={[styles.rowDescription, disabled && styles.textDisabled]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: Colors.switchTrackOff, true: Colors.primary }}
        thumbColor={Colors.white}
        accessibilityLabel={label}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
      />
    </View>
  );
}
