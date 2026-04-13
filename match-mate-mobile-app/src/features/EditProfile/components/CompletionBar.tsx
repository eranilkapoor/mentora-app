import { useThemedStyles } from "@/core/theme/useThemedStyles";
import { editProfileStyles } from "../EditProfileScreen.styles";
import { Colors } from "@/core/constants/colors";
import { View, Text } from "react-native";

export function CompletionBar({ percent }: { percent: number }): React.ReactElement {
  const styles = useThemedStyles(editProfileStyles);
  const color =
    percent < 40
      ? Colors.danger
      : percent < 75
        ? Colors.accent
        : Colors.success;

  return (
    <View style={styles.completionCard}>
      <View style={styles.completionRow}>
        <View>
          <Text style={styles.completionTitle}>Profile Completion</Text>
          <Text style={styles.completionSubtitle}>
            {percent < 50
              ? 'Add more details to get better matches'
              : percent < 100
                ? 'Almost there! Complete your profile'
                : 'Your profile is complete 🎉'}
          </Text>
        </View>
        <Text style={[styles.completionPercent, { color }]}>{percent}%</Text>
      </View>
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${percent}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
}
