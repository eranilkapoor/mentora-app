import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { notificationStyles } from '../NotificationsScreen.styles';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '@/core/constants/colors';

export function EmptyState(): React.ReactElement {
  const styles = useThemedStyles(notificationStyles);
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIconWrapper}>
        <Feather name="bell-off" size={32} color={Colors.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptySubtitle}>
        When you get matches, messages or activity{'\n'}they'll show up here.
      </Text>
    </View>
  );
}
