import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../core/components/Header';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { membershipStyles } from './MembershipScreen.styles';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Plan {
  name: string;
  price: string;
  contacts: number;
  superInterest: number;
  best?: boolean;
}

interface FeatureRowProps {
  label: string;
  values?: string[];
  selectedIndex: number;
}

interface DurationPlan {
  months: number;
  price: string;
  oldPrice: string;
  perMonth: string;
}

interface PlanCardProps {
  plan: DurationPlan;
  active: boolean;
  onPress: () => void;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PLANS: Plan[] = [
  { name: 'Pro Lite', price: '₹1,999', contacts: 0, superInterest: 0 },
  { name: 'Pro', price: '₹3,999', contacts: 25, superInterest: 0 },
  {
    name: 'Pro Max',
    price: '₹6,999',
    contacts: 50,
    superInterest: 50,
    best: true,
  },
];

const FEATURES: { label: string; values: string[] }[] = [
  { label: 'Unlimited calls & chat', values: ['✔', '✔', '✔'] },
  { label: 'Engage+', values: ['✔', '✔', '✔'] },
  { label: 'Advanced Search', values: ['✔', '✔', '✔'] },
  { label: 'View Contact Numbers', values: ['0', '25', '50'] },
  { label: 'Super Interest', values: ['0', '0', '50'] },
];

const DURATION_PLANS: DurationPlan[] = [
  { months: 3, price: '₹16,585', oldPrice: '₹33,169', perMonth: '₹5,528/mo' },
  { months: 6, price: '₹26,186', oldPrice: '₹52,372', perMonth: '₹4,364/mo' },
  { months: 12, price: '₹42,373', oldPrice: '₹84,745', perMonth: '₹3,531/mo' },
];

const BENEFITS = [
  { icon: '⭐', text: 'All Pro Max benefits + unlimited daily matches' },
  { icon: '👩‍💼', text: 'Dedicated relationship manager assigned to you' },
];

const POINTS = [
  'Enhance and optimise your profile',
  'Find the most relevant & serious matches',
  'Get additional info on the bride & her family',
  '3× faster matching with priority placement',
  'Unlimited meeting setups with profiles',
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const FeatureRow: React.FC<FeatureRowProps> = ({
  label,
  values = ['✔', '✔', '✔'],
  selectedIndex,
}) => {
  const styles = useThemedStyles(membershipStyles);

  return (
    <View style={styles.featureRow}>
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
};

const PlanCard: React.FC<PlanCardProps> = ({ plan, active, onPress }) => {
  const styles = useThemedStyles(membershipStyles);

  return (
    <TouchableOpacity
      style={[styles.planCard, active && styles.planCardActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {plan.months === 6 && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>Popular</Text>
        </View>
      )}
      <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
        {active && <View style={styles.radioInner} />}
      </View>
      <Text style={[styles.planMonths, active && styles.planMonthsActive]}>
        {plan.months} months
      </Text>
      <Text style={[styles.planPrice, active && styles.planPriceActive]}>
        {plan.price}
      </Text>
      <Text style={styles.oldPrice}>{plan.oldPrice}</Text>
      <View style={styles.perMonthBadge}>
        <Text style={styles.perMonthText}>{plan.perMonth}</Text>
      </View>
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function MembershipScreen() {
  const styles = useThemedStyles(membershipStyles);

  const [tab, setTab] = useState<'self' | 'assisted'>('self');

  const [duration, setDuration] = useState<number>(6);
  const [selectedPlan, setSelectedPlan] = useState<string>('Pro Max');
  const selectedIndex = PLANS.findIndex((p) => p.name === selectedPlan);

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <Header />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Page title ── */}
        <Text style={styles.pageTitle}>Choose Your Plan</Text>
        <Text style={styles.pageSubtitle}>Find your perfect match, faster</Text>

        {/* ── Tabs ── */}
        <View style={styles.tabs}>
          {(['self', 'assisted'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.activeTab]}
              onPress={() => setTab(t)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, tab === t && styles.activeTabText]}>
                {t === 'self' ? 'Self-Service' : 'Assisted'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'self' ? (
          <>
            {/* ── Refund banner ── */}
            <View style={styles.refundBanner}>
              <Text style={styles.refundIcon}>🔁</Text>
              <View>
                <Text style={styles.refundText}>
                  30-day full refund guarantee
                </Text>
                <Text style={styles.refundSub}>*Terms & conditions apply</Text>
              </View>
            </View>

            {/* ── Plan cards ── */}
            <View style={styles.planRow}>
              {PLANS.map((plan) => {
                const active = selectedPlan === plan.name;
                return (
                  <TouchableOpacity
                    key={plan.name}
                    style={[styles.planCard, active && styles.planCardActive]}
                    onPress={() => setSelectedPlan(plan.name)}
                    activeOpacity={0.85}
                  >
                    {plan.best && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularBadgeText}>⭐ Top</Text>
                      </View>
                    )}
                    <Text
                      style={[styles.planName, active && styles.planNameActive]}
                    >
                      {plan.name}
                    </Text>
                    <Text
                      style={[
                        styles.planPrice,
                        active && styles.planPriceActive,
                      ]}
                    >
                      {plan.price}
                    </Text>
                    <Text style={styles.planDuration}>/ 3 months</Text>
                    <View
                      style={[
                        styles.radioOuter,
                        active && styles.radioOuterActive,
                      ]}
                    >
                      {active && <View style={styles.radioInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Feature table header ── */}
            <View style={styles.featureHeader}>
              <Text style={styles.featureHeaderLabel}>Features</Text>
              <View style={styles.featureValues}>
                {PLANS.map((p, i) => (
                  <Text
                    key={p.name}
                    style={[
                      styles.featureHeaderCol,
                      i === selectedIndex && styles.featureHeaderColActive,
                    ]}
                    numberOfLines={1}
                  >
                    {p.name.replace('Pro ', '')}
                  </Text>
                ))}
              </View>
            </View>

            {/* ── Feature rows ── */}
            <View style={styles.featureTable}>
              {FEATURES.map((f) => (
                <FeatureRow
                  key={f.label}
                  label={f.label}
                  values={f.values}
                  selectedIndex={selectedIndex}
                />
              ))}
            </View>

            {/* ── Trust badges ── */}
            <View style={styles.trustRow}>
              {[
                '🔒 Secure Payment',
                '✅ Verified Profiles',
                '💬 24/7 Support',
              ].map((badge) => (
                <View key={badge} style={styles.trustBadge}>
                  <Text style={styles.trustText}>{badge}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* ── Section label ── */}
            <View style={styles.sectionLabelRow}>
              <View style={styles.exclusivePill}>
                <Text style={styles.exclusivePillText}>✦ EXCLUSIVE</Text>
              </View>
              <View style={styles.dividerLine} />
            </View>

            {/* ── Benefits card ── */}
            <View style={styles.card}>
              <View style={styles.cardTopAccent} />
              {BENEFITS.map((b) => (
                <View key={b.text} style={styles.benefitRow}>
                  <Text style={styles.benefitIcon}>{b.icon}</Text>
                  <Text style={styles.benefitText}>{b.text}</Text>
                </View>
              ))}

              <View style={styles.divider} />

              <View style={styles.pointsContainer}>
                {POINTS.map((p) => (
                  <View key={p} style={styles.pointRow}>
                    <View style={styles.pointDot} />
                    <Text style={styles.pointText}>{p}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.callbackBtn}
                  activeOpacity={0.85}
                >
                  <Text style={styles.callbackText}>📞 Request Call Back</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={styles.knowMoreText}>Know more ›</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── Offer banner ── */}
            <View style={styles.offerBanner}>
              <Text style={styles.offerEmoji}>🎉</Text>
              <Text style={styles.offerText}>FLAT 50% OFF ON ALL PLANS</Text>
              <Text style={styles.offerEmoji}>🎉</Text>
            </View>

            {/* ── Duration plans ── */}
            <View style={styles.planRow}>
              {DURATION_PLANS.map((plan) => (
                <PlanCard
                  key={plan.months}
                  plan={plan}
                  active={duration === plan.months}
                  onPress={() => setDuration(plan.months)}
                />
              ))}
            </View>

            {/* ── Savings callout ── */}
            <View style={styles.savingsRow}>
              <Text style={styles.savingsText}>
                💡 Save more with longer plans — up to{' '}
                <Text style={styles.savingsHighlight}>₹42,372</Text> saved on 12
                months
              </Text>
            </View>

            {/* ── Trust badges ── */}
            <View style={styles.trustRow}>
              {[
                '🔒 Secure Payment',
                '✅ Verified Profiles',
                '🏆 10M+ Members',
              ].map((badge) => (
                <View key={badge} style={styles.trustBadge}>
                  <Text style={styles.trustText}>{badge}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* ── Sticky CTA ── */}
      {tab === 'self' ? (
        <View style={styles.ctaContainer}>
          <View style={styles.ctaInfo}>
            <Text style={styles.ctaPlan}>{selectedPlan}</Text>
            <Text style={styles.ctaPrice}>
              {PLANS.find((p) => p.name === selectedPlan)?.price}
            </Text>
          </View>
          <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85}>
            <Text style={styles.ctaButtonText}>Get {selectedPlan} →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.ctaContainer}>
          <View style={styles.ctaInfo}>
            <Text style={styles.ctaPlan}>Selected</Text>
            <Text style={styles.ctaPrice}>
              {DURATION_PLANS.find((p) => p.months === duration)?.price}
            </Text>
            <Text style={styles.ctaDuration}>{duration} months</Text>
          </View>
          <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85}>
            <Text style={styles.ctaButtonText}>Get Exclusive Now →</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
