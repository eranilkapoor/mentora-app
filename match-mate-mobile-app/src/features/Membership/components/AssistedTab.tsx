import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { membershipStyles } from '../Membership.styles';
import { PlanCard } from './PlanCard';
import {
  ASSISTED_TRUST_BADGES,
  BENEFITS,
  DURATION_PLANS,
  POINTS_KEYS,
} from '../Membership.constants';

interface Props {
  duration: number;
  onDurationChange: (months: number) => void;
}

export function AssistedTab({
  duration,
  onDurationChange,
}: Props): React.ReactElement {
  const styles = useThemedStyles(membershipStyles);
  const { t } = useTranslation();

  return (
    <>
      {/* Exclusive label */}
      <View style={styles.sectionLabelRow}>
        <View style={styles.exclusivePill}>
          <Text style={styles.exclusivePillText}>
            {t('membership.exclusive_label').toUpperCase()}
          </Text>
        </View>
        <View style={styles.dividerLine} />
      </View>

      {/* Benefits card */}
      <View style={styles.card}>
        <View style={styles.cardTopAccent} />

        {BENEFITS.map((b) => (
          <View key={b.textKey} style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>{b.icon}</Text>
            <Text style={styles.benefitText}>{t(b.textKey)}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.pointsContainer}>
          {POINTS_KEYS.map((key) => (
            <View key={key} style={styles.pointRow}>
              <View style={styles.pointDot} />
              <Text style={styles.pointText}>{t(key)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.callbackBtn} activeOpacity={0.85}>
            <Text style={styles.callbackText}>
              📞 {t('membership.request_callback')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.knowMoreText}>{t('membership.know_more')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Offer banner */}
      <View style={styles.offerBanner}>
        <Text style={styles.offerEmoji}>🎉</Text>
        <Text style={styles.offerText}>{t('membership.offer_text')}</Text>
        <Text style={styles.offerEmoji}>🎉</Text>
      </View>

      {/* Duration plan cards */}
      <View style={styles.planRow}>
        {DURATION_PLANS.map((plan) => (
          <PlanCard
            key={plan.months}
            plan={plan}
            active={duration === plan.months}
            onPress={() => onDurationChange(plan.months)}
          />
        ))}
      </View>

      {/* Savings callout */}
      <View style={styles.savingsRow}>
        <Text style={styles.savingsText}>
          💡{' '}
          <Text>
            {t('membership.savings_text', {
              amount: '₹42,372',
            })}
          </Text>
        </Text>
      </View>

      {/* Trust badges */}
      <View style={styles.trustRow}>
        {ASSISTED_TRUST_BADGES.map((badge) => (
          <View key={badge.labelKey} style={styles.trustBadge}>
            <Text style={styles.trustText}>
              {badge.icon} {t(badge.labelKey)}
            </Text>
          </View>
        ))}
      </View>
    </>
  );
}
