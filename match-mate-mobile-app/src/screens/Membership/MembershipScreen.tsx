import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

// ─── Sub-components ───────────────────────────────────────────────────────────

const FeatureRow: React.FC<FeatureRowProps> = ({
  label,
  values = ['✔', '✔', '✔'],
  selectedIndex,
}) => (
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

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function MembershipScreen() {
  const [tab, setTab] = useState<'self' | 'assisted'>('self');
  const [selectedPlan, setSelectedPlan] = useState<string>('Pro Max');

  const selectedIndex = PLANS.findIndex((p) => p.name === selectedPlan);

  return (
    <SafeAreaView style={styles.container}>
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

        {/* ── Refund banner ── */}
        <View style={styles.refundBanner}>
          <Text style={styles.refundIcon}>🔁</Text>
          <View>
            <Text style={styles.refundText}>30-day full refund guarantee</Text>
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
                  <View style={styles.bestBadge}>
                    <Text style={styles.bestBadgeText}>⭐ Top</Text>
                  </View>
                )}
                <Text
                  style={[styles.planName, active && styles.planNameActive]}
                >
                  {plan.name}
                </Text>
                <Text
                  style={[styles.planPrice, active && styles.planPriceActive]}
                >
                  {plan.price}
                </Text>
                <Text style={styles.planDuration}>/ 3 months</Text>
                <View
                  style={[styles.radioOuter, active && styles.radioOuterActive]}
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
          {['🔒 Secure Payment', '✅ Verified Profiles', '💬 24/7 Support'].map(
            (badge) => (
              <View key={badge} style={styles.trustBadge}>
                <Text style={styles.trustText}>{badge}</Text>
              </View>
            )
          )}
        </View>
      </ScrollView>

      {/* ── Sticky CTA ── */}
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
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const RED = '#D32F2F';
const RED_LIGHT = '#FDECEA';
const GREEN = '#2E7D32';
const GREEN_LIGHT = '#E8F5E9';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  scroll: { paddingHorizontal: 16, paddingBottom: 110 },

  // Page title
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 20,
  },
  pageSubtitle: { fontSize: 13, color: '#888', marginTop: 2, marginBottom: 20 },

  // Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#EFEFEF',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: { fontSize: 13, color: '#888', fontWeight: '500' },
  activeTabText: { color: RED, fontWeight: '700' },

  // Refund banner
  refundBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN_LIGHT,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    gap: 10,
  },
  refundIcon: { fontSize: 20 },
  refundText: { fontSize: 13, fontWeight: '700', color: GREEN },
  refundSub: { fontSize: 11, color: '#388E3C', marginTop: 2 },

  // Plan cards
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  planCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
    position: 'relative',
  },
  planCardActive: {
    borderColor: RED,
    backgroundColor: RED_LIGHT,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  bestBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#388E3C',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  bestBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  planName: { fontSize: 12, fontWeight: '700', color: '#555', marginTop: 8 },
  planNameActive: { color: RED },
  planPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A1A',
    marginTop: 4,
  },
  planPriceActive: { color: RED },
  planDuration: { fontSize: 10, color: '#999', marginBottom: 10 },
  radioOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: { borderColor: RED },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RED,
  },

  // Feature table
  featureHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderColor: RED,
    marginBottom: 2,
  },
  featureHeaderLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  featureHeaderCol: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
  },
  featureHeaderColActive: { color: RED, fontWeight: '800' },

  featureTable: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: '#F5F5F5',
    alignItems: 'center',
  },
  featureLabel: { flex: 1, fontSize: 12, color: '#444' },
  featureValues: {
    flexDirection: 'row',
    width: '45%',
    justifyContent: 'space-around',
  },
  featureCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  featureCellActive: { backgroundColor: RED_LIGHT },
  featureValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#555',
    textAlign: 'center',
  },
  featureValueActive: { color: RED },
  featureCheck: { color: '#2E7D32' },
  featureZero: { color: '#BBBBBB' },

  // Trust badges
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  trustBadge: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  trustText: { fontSize: 11, color: '#555', fontWeight: '500' },

  // CTA
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#EEEEEE',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 10,
  },
  ctaInfo: { flex: 1 },
  ctaPlan: { fontSize: 12, color: '#888' },
  ctaPrice: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  ctaButton: {
    flex: 2,
    backgroundColor: RED,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
