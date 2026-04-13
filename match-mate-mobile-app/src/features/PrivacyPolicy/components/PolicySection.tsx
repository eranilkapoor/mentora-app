import { useThemedStyles } from "@/core/theme/useThemedStyles";
import { SectionItem } from "../PrivacyPolicy.types";
import { privacyPolicyStyles } from "../PrivacyPolicyScreen.styles";
import { View, Text } from "react-native";
import { BulletList } from "./BulletList";

export function PolicySection({
  section,
}: {
  section: SectionItem;
}): React.ReactElement {
  const styles = useThemedStyles(privacyPolicyStyles);

  return (
    <View style={styles.policySection}>
      <Text style={styles.heading}>{section.heading}</Text>

      {section.paragraph !== undefined && (
        <Text style={styles.paragraph}>{section.paragraph}</Text>
      )}

      {section.bullets !== undefined && <BulletList items={section.bullets} />}

      {section.subSections?.map((sub) => (
        <View key={sub.title}>
          <Text style={styles.subHeading}>{sub.title}</Text>
          <BulletList items={sub.bullets} />
        </View>
      ))}
    </View>
  );
}