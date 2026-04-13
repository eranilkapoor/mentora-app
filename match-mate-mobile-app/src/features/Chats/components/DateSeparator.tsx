import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { chatStyles } from '../ChatScreen.styles';
import { formatDateLabel } from '../Chat.types';
import { View, Text } from 'react-native';

export function DateSeparator({ ts }: { ts: number }): React.ReactElement {
  const styles = useThemedStyles(chatStyles);
  return (
    <View style={styles.dateSeparator}>
      <View style={styles.dateLine} />
      <Text style={styles.dateText}>{formatDateLabel(ts)}</Text>
      <View style={styles.dateLine} />
    </View>
  );
}
