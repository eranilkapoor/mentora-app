import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { profileStyles } from '../Profile.styles';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';

export function TagList({ items }: { items: string[] }): React.ReactElement {
  const styles = useThemedStyles(profileStyles);
  const { theme } = useTheme();

  if (items.length === 0) {
    return <Text style={styles.tagEmptyText}>—</Text>;
  }

  return (
    <View style={styles.tagList}>
      {items.map((item, index) => (
        <View key={`${item}-${index}`} style={styles.tag}>
          <Feather name="check" size={12} color={theme.colors.primary} />
          <Text style={styles.tagText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}
