import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { SectionProps } from '../Profile.types';
import { profileStyles } from '../Profile.styles';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';

export function Section({
  title,
  icon,
  children,
}: SectionProps): React.ReactElement {
  const styles = useThemedStyles(profileStyles);
  const { theme } = useTheme();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconWrapper}>
          <Feather name={icon} size={14} color={theme.colors.primary} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.card}>{children}</View>
    </View>
  );
}
