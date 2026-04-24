import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { SectionProps } from '../Settings.types';
import { settingsStyles } from '../Settings.styles';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '@/core/constants/colors';

export function Section({
  icon,
  title,
  children,
}: SectionProps): React.ReactElement {
  const styles = useThemedStyles(settingsStyles);
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconWrapper}>
          <Feather name={icon} size={13} color={Colors.primary} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}
