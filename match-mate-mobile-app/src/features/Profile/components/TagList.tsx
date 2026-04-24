import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { profileStyles } from '../Profile.styles';
import { View, Text } from 'react-native';

export function TagList({ items }: { items: string[] }): React.ReactElement {
  const styles = useThemedStyles(profileStyles);

  return (
    <View style={styles.tagList}>
      {items.map((item) => (
        <View key={item} style={styles.tag}>
          <Text style={styles.tagText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}
