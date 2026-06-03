import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { SectionItem } from '../PrivacyPolicy.types';
import { privacyPolicyStyles } from '../PrivacyPolicy.styles';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BulletList } from './BulletList';

export function PolicySection({
  section,
}: {
  section: SectionItem;
}): React.ReactElement {
  const styles = useThemedStyles(privacyPolicyStyles);
  const { t } = useTranslation();

  return (
    <View style={styles.policySection}>
      <Text style={styles.heading}>{t(section.heading)}</Text>

      {section.paragraph !== undefined && (
        <Text style={styles.paragraph}>{t(section.paragraph)}</Text>
      )}

      {section.bullets !== undefined && (
        <BulletList items={section.bullets.map((item) => t(item))} />
      )}

      {section.subSections?.map((sub) => (
        <View key={sub.title}>
          <Text style={styles.subHeading}>{t(sub.title)}</Text>
          <BulletList items={sub.bullets.map((item) => t(item))} />
        </View>
      ))}
    </View>
  );
}
