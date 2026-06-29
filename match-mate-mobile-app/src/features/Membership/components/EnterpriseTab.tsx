import React from 'react';
import { Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { membershipStyles } from '../Membership.styles';
import { ENTERPRISE_TRUST_BADGES } from '../Membership.constants';
import { DisplayFeatureRow, DisplayPlan } from '../Membership.types';
import { FeatureRow } from './FeatureRow';

interface Props {
  displayPlans: DisplayPlan[];
  featureRows: DisplayFeatureRow[];
  selectedIndex: number;
}

export function EnterpriseTab({
  displayPlans,
  featureRows,
  selectedIndex,
}: Props): React.ReactElement {
  const styles = useThemedStyles(membershipStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const selected = displayPlans[selectedIndex] ?? displayPlans[0];

  return (
    <>
      <View style={styles.sectionLabelRow}>
        <View style={styles.exclusivePill}>
          <Text style={styles.exclusivePillText}>
            {t('membership.enterprise_label').toUpperCase()}
          </Text>
        </View>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.enterpriseCard}>
        <View style={styles.cardTopAccent} />
        <View style={styles.enterpriseHeader}>
          <View style={styles.enterpriseIcon}>
            <Feather name="briefcase" size={19} color={theme.colors.primary} />
          </View>
          <View style={styles.enterpriseHeaderCopy}>
            <Text style={styles.enterpriseEyebrow}>
              {t('membership.enterprise_label').toUpperCase()}
            </Text>
            <Text style={styles.enterpriseTitle}>
              {selected?.name ?? t('membership.enterprise_label')}
            </Text>
          </View>
        </View>
        <Text style={styles.enterpriseDescription}>
          {selected?.description ?? t('membership.enterprise_description')}
        </Text>
        <View style={styles.enterpriseFooter}>
          <Text style={styles.enterprisePrice}>
            {selected?.price ?? t('membership.custom_pricing')}
          </Text>
          <Text style={styles.enterpriseTerms}>
            {t('membership.custom_terms')}
          </Text>
        </View>
      </View>

      <View style={styles.featureTableCard}>
        <View style={styles.featureTableHeader}>
          <Text style={styles.featureHeaderLabel}>
            {t('membership.features_header')}
          </Text>
          <View style={styles.featureValues}>
            <Text
              style={[styles.featureHeaderCol, styles.featureHeaderColActive]}
            >
              {t('membership.custom_value')}
            </Text>
          </View>
        </View>
        {featureRows.map((feature, index) => (
          <FeatureRow
            key={feature.key}
            label={feature.label}
            values={[
              feature.values[selectedIndex] ?? t('membership.custom_value'),
            ]}
            selectedIndex={0}
            isLast={index === featureRows.length - 1}
          />
        ))}
      </View>

      <View style={styles.trustRow}>
        {ENTERPRISE_TRUST_BADGES.map((badge) => (
          <View key={badge.labelKey} style={styles.trustBadge}>
            <Feather name={badge.icon} size={13} color={theme.colors.primary} />
            <Text style={styles.trustText}>{t(badge.labelKey)}</Text>
          </View>
        ))}
      </View>
    </>
  );
}
