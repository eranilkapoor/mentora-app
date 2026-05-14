import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { profileStyles } from '../Profile.styles';
import { View, Text } from 'react-native';

export function TagList({ items }: { items: string[] }): React.ReactElement {
  const styles = useThemedStyles(profileStyles);

  if (items.length === 0) {
    return <Text style={styles.tagEmptyText}>—</Text>;
  }

  return (
    <View style={styles.tagList}>
      {items.map((item, index) => (
        <View key={`${item}-${index}`} style={styles.tag}>
          <Text style={styles.tagText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}
