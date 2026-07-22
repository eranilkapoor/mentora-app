import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { ContactItem } from '../HelpSupport.types';
import { helpSupportStyles } from '../HelpSupport.styles';
import { TouchableOpacity, View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';

export function ContactRow({
  icon,
  label,
  value,
  action,
  iconColor,
  isLast,
}: ContactItem): React.ReactElement {
  const styles = useThemedStyles(helpSupportStyles);
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.contactRow, isLast && styles.contactRowLast]}
      onPress={action}
      accessibilityRole="link"
      accessibilityLabel={label}
    >
      <View style={styles.contactIconWrapper}>
        <Feather
          name={icon}
          size={18}
          color={iconColor ?? theme.colors.textSecondary}
        />
      </View>
      <View style={styles.contactTextWrapper}>
        <Text style={styles.contactLabel}>{label}</Text>
        <Text style={styles.contactValue}>{value}</Text>
      </View>
      <Feather name="chevron-right" size={15} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );
}
