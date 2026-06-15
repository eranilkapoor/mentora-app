import React, { useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import type { PaymentGateway } from '@matchmate/api-contract';
import { membershipStyles } from './Membership.styles';
import { MembershipTab } from './Membership.types';
import { useMembershipData } from './hooks/useMembershipData';
import { useMembershipActions } from './hooks/useMembershipActions';
import { MembershipHeroCard } from './components/MembershipHeroCard';
import { SelfServiceTab } from './components/SelfServiceTab';
import { AssistedTab } from './components/AssistedTab';
import { MembershipCta } from './components/MembershipCta';
import { PaymentOptionSheet } from './components/PaymentOptionSheet';
import { MEMBERSHIP_TABS } from './Membership.constants';

export default function MembershipScreen(): React.ReactElement {
  const styles = useThemedStyles(membershipStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<MembershipTab>('self');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const {
    displayPlans,
    featureRows,
    selectedPlan,
    setSelectedPlan,
    selectedPlanItem,
    boostPlan,
    selectedIndex,
    activePlanName = 'Free',
    isFetchingPlans,
  } = useMembershipData(activeTab);

  const {
    handleCreateOrder,
    handleCreateBoostOrder,
    handleStartTrial,
    isCreatingOrder,
  } = useMembershipActions();

  const onCreateOrder = useCallback(() => {
    if (selectedPlanItem?.isFree) return;
    if ((selectedPlanItem?.source?.trialDays ?? 0) > 0) {
      void handleStartTrial(selectedPlanItem);
      return;
    }
    setIsCheckoutOpen(true);
  }, [handleStartTrial, selectedPlanItem]);

  const onConfirmCheckout = useCallback(
    async (gateway: PaymentGateway) => {
      await handleCreateOrder(selectedPlanItem, gateway);
      setIsCheckoutOpen(false);
    },
    [handleCreateOrder, selectedPlanItem]
  );

  const onCreateBoostOrder = useCallback(() => {
    if (!boostPlan) return;
    void handleCreateBoostOrder({
      id: boostPlan._id,
      name: boostPlan.name.replace(/_/g, ' '),
      price: `${boostPlan.currency} ${boostPlan.price}`,
      durationLabel: t('membership.boost.duration'),
      best: false,
      featureValues: {},
      source: boostPlan,
    });
  }, [boostPlan, handleCreateBoostOrder, t]);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={t('membership.screen_title')}
        subtitle={t('membership.screen_subtitle')}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ───────────────────────────────────────────────── */}
        <MembershipHeroCard activePlanName={activePlanName} />

        {/* ── Tab switcher ───────────────────────────────────────── */}
        <View style={styles.tabs}>
          {MEMBERSHIP_TABS.map((tabItem) => {
            const isActive = activeTab === tabItem.key;
            return (
              <TouchableOpacity
                key={tabItem.key}
                style={[styles.tab, isActive && styles.activeTab]}
                onPress={() => setActiveTab(tabItem.key)}
                activeOpacity={0.8}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={t(tabItem.labelKey)}
              >
                <Feather
                  name={tabItem.icon}
                  size={14}
                  color={
                    isActive ? theme.colors.primary : theme.colors.textMuted
                  }
                />
                <Text
                  style={[styles.tabText, isActive && styles.activeTabText]}
                >
                  {t(tabItem.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Tab content ────────────────────────────────────────── */}
        {activeTab === 'self' ? (
          <SelfServiceTab
            displayPlans={displayPlans}
            featureRows={featureRows}
            selectedPlan={selectedPlan}
            selectedIndex={selectedIndex}
            onSelectPlan={setSelectedPlan}
          />
        ) : (
          <AssistedTab
            displayPlans={displayPlans}
            featureRows={featureRows}
            selectedPlan={selectedPlan}
            selectedIndex={selectedIndex}
            onSelectPlan={setSelectedPlan}
          />
        )}

        {boostPlan ? (
          <View style={styles.boostCard}>
            <View style={styles.boostIcon}>
              <Feather name="zap" size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.boostCopy}>
              <Text style={styles.boostTitle}>
                {t('membership.boost.title')}
              </Text>
              <Text style={styles.boostSubtitle}>
                {t('membership.boost.subtitle')}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.boostButton}
              activeOpacity={0.85}
              disabled={isCreatingOrder}
              onPress={onCreateBoostOrder}
              accessibilityRole="button"
              accessibilityLabel={t('membership.boost.buy')}
            >
              <Text style={styles.boostButtonText}>
                {boostPlan.currency} {boostPlan.price}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>

      {/* ── Sticky CTA ─────────────────────────────────────────────── */}
      <MembershipCta
        tab={activeTab}
        selectedPlanItem={selectedPlanItem}
        isCreatingOrder={isCreatingOrder}
        isFetchingPlans={isFetchingPlans}
        onCreateOrder={onCreateOrder}
      />

      <PaymentOptionSheet
        visible={isCheckoutOpen}
        selectedPlanItem={selectedPlanItem}
        isCreatingOrder={isCreatingOrder}
        onClose={() => setIsCheckoutOpen(false)}
        onContinue={(gateway) => {
          void onConfirmCheckout(gateway);
        }}
      />
    </SafeAreaView>
  );
}
