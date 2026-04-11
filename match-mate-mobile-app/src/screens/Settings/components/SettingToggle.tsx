import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { SettingToggleProps } from '../Settings.types';
import { settingsStyles } from '../SettingsScreen.styles';
import { Switch, View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '@/core/constants/colors';

export function SettingToggle({
  icon,
  label,
  subLabel,
  value,
  onValueChange,
  isLast,
}: SettingToggleProps): React.ReactElement {
  const styles = useThemedStyles(settingsStyles);
  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
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
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.switchTrackOff, true: Colors.primary }}
        thumbColor={Colors.white}
        accessibilityLabel={label}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
      />
    </View>
  );
}
