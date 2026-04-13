import { useThemedStyles } from "@/core/theme/useThemedStyles";
import { ContactItem } from "../HelpSupport.types";
import { helpSupportStyles } from "../HelpSupportScreen.styles";
import { TouchableOpacity, View, Text } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { Colors } from "@/core/constants/colors";

export function ContactRow({
  icon,
  label,
  value,
  action,
  iconColor,
  isLast,
}: ContactItem): React.ReactElement {
  const styles = useThemedStyles(helpSupportStyles);

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
          color={iconColor ?? Colors.textSecondary}
        />
      </View>
      <View style={styles.contactTextWrapper}>
        <Text style={styles.contactLabel}>{label}</Text>
        <Text style={styles.contactValue}>{value}</Text>
      </View>
      <Feather name="chevron-right" size={15} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}