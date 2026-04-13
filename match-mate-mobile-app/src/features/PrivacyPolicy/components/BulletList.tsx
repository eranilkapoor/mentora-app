import { useThemedStyles } from "@/core/theme/useThemedStyles";
import { privacyPolicyStyles } from "../PrivacyPolicyScreen.styles";
import { View, Text } from "react-native";

export function BulletList({ items }: { items: string[] }): React.ReactElement {
  const styles = useThemedStyles(privacyPolicyStyles);

  return (
    <View>
      {items.map((item) => (
        <View key={item} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}