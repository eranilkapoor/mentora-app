import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

// ─── Constants ────────────────────────────────────────────────────────────────

const GOLD = Colors.accent;
const GOLD_LIGHT = Colors.accentLight;

// ─── Types ────────────────────────────────────────────────────────────────────

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

const PlanCard: React.FC<PlanCardProps> = ({ plan, active, onPress }) => (
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

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AssistedMembershipScreen() {
  const [tab, setTab] = useState<'self' | 'assisted'>('assisted');
  const [duration, setDuration] = useState<number>(6);

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JS</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Upgrade Membership</Text>
            <Text style={styles.headerSub}>Assisted Plan</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.helpBtn}>
          <Text style={styles.helpText}>Need help?</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
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
            <TouchableOpacity style={styles.callbackBtn} activeOpacity={0.85}>
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

        {/* ── Trust strip ── */}
        <View style={styles.trustStrip}>
          {['🔒 Secure', '✅ Verified', '🏆 10M+ Members'].map((t) => (
            <View key={t} style={styles.trustItem}>
              <Text style={styles.trustText}>{t}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ── Sticky CTA ── */}
      <View style={styles.ctaContainer}>
        <View style={styles.ctaLeft}>
          <Text style={styles.ctaLabel}>Selected</Text>
          <Text style={styles.ctaPrice}>
            {DURATION_PLANS.find((p) => p.months === duration)?.price}
          </Text>
          <Text style={styles.ctaDuration}>{duration} months</Text>
        </View>
        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85}>
          <Text style={styles.ctaButtonText}>Get Exclusive Now →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundPage,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },

  // Header
  header: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderColor: Colors.divider,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  helpBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  helpText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 10,
    padding: 4,
    marginTop: 16,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '700',
  },

  // Section label
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  exclusivePill: {
    backgroundColor: GOLD_LIGHT,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: GOLD,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 10,
  },
  exclusivePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: GOLD,
    letterSpacing: 1,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.divider,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 2,
  },
  cardTopAccent: {
    height: 4,
    backgroundColor: GOLD,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingTop: 14,
    gap: 8,
  },
  benefitIcon: { fontSize: 18 },
  benefitText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: 14,
    marginTop: 12,
  },
  pointsContainer: {
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
    gap: 8,
  },
  pointDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 6,
  },
  pointText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textBody,
    lineHeight: 20,
  },

  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 14,
  },
  callbackBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  callbackText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  knowMoreText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },

  // Offer banner
  offerBanner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: 10,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  offerEmoji: { fontSize: 16 },
  offerText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },

  // Plan cards
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 14,
  },
  planCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    backgroundColor: Colors.white,
    position: 'relative',
  },
  planCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
    elevation: 4,
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: GOLD,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  popularBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '800',
  },

  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  radioOuterActive: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },

  planMonths: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textBody,
  },
  planMonthsActive: {
    color: Colors.primary,
  },
  planPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  planPriceActive: {
    color: Colors.primary,
  },
  oldPrice: {
    fontSize: 11,
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
    marginBottom: 6,
  },
  perMonthBadge: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  perMonthText: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontWeight: '600',
  },

  // Savings
  savingsRow: {
    backgroundColor: Colors.successLight,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  savingsText: {
    fontSize: 12,
    color: Colors.success,
    lineHeight: 18,
  },
  savingsHighlight: {
    fontWeight: '800',
  },

  // Trust strip
  trustStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  trustItem: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  trustText: {
    fontSize: 11,
    color: Colors.textBody,
    fontWeight: '500',
  },

  // CTA
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderColor: Colors.divider,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 10,
  },
  ctaLeft: { flex: 1 },
  ctaLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  ctaPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  ctaDuration: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  ctaButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 6,
  },
  ctaButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
