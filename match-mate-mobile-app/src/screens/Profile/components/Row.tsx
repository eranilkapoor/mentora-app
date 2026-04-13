import { useThemedStyles } from "@/core/theme/useThemedStyles";
import { RowProps } from "../Profile.types";
import { profileStyles } from "../ProfileScreen.styles";
import { View, Text } from "react-native";

export function Row({ label, value }: RowProps): React.ReactElement {
  const styles = useThemedStyles(profileStyles);
  const displayValue = Array.isArray(value)
    ? value.join(', ') || '—'
    : (value ?? '—');

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{displayValue}</Text>
    </View>
  );
}