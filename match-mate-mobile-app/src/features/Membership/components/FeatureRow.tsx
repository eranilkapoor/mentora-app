import { useThemedStyles } from "@/core/theme/useThemedStyles";
import { FeatureRowProps } from "../Membership.types";
import { membershipStyles } from "../MembershipScreen.styles";
import { View, Text } from "react-native";

export function FeatureRow({
  label,
  values,
  selectedIndex,
  isLast,
}: FeatureRowProps): React.ReactElement {
  const styles = useThemedStyles(membershipStyles);
  return (
    <View style={[styles.featureRow, isLast && styles.featureRowLast]}>
      <Text style={styles.featureLabel}>{label}</Text>
      <View style={styles.featureValues}>
        {values.map((v, i) => (
          <View
            key={i}
            style={[
              styles.featureCell,
              i === selectedIndex && styles.featureCellActive,
            ]}
          >
            <Text
              style={[
                styles.featureValue,
                v === '✔' && styles.featureCheck,
                v === '0' && styles.featureZero,
                i === selectedIndex && styles.featureValueActive,
              ]}
            >
              {v}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}