import React, { useCallback, useMemo, useState } from 'react';
import { CommonActions } from '@react-navigation/native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import type { PaymentGateway } from '@mentora/api-contract';
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
import { useUpgradePrompt } from './hooks/useUpgradePrompt';
import { navigationRef } from '@/navigation/navigationRef';
import { showConfirm } from '@/core/utils/confirm';

export default function MembershipScreen(): React.ReactElement {
  const styles = useThemedStyles(membershipStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();
  const showUpgradePrompt = useUpgradePrompt();

  const [activeTab, setActiveTab] = useState<MembershipTab>('self');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const closeCheckout = useCallback(() => setIsCheckoutOpen(false), []);

  const {
    displayPlans,
    featureRows,
    selectedPlan,
    setSelectedPlan,
    selectedPlanItem,
    boostPlan,
    canUseProfileBoost,
    selectedIndex,
    activePlanName = 'Free',
    isFetchingPlans,
    billingCycles,
    selectedBillingCycle,
    setSelectedBillingCycle,
  } = useMembershipData(activeTab);

  const {
    handleCreateOrder,
    handleCreateBoostOrder,
    storePrices,
    isCreatingOrder,
  } = useMembershipActions({ onMembershipActivated: closeCheckout });

  const pricedDisplayPlans = useMemo(
    () =>
      displayPlans.map((plan) => ({
        ...plan,
        price: plan.id ? (storePrices[plan.id] ?? plan.price) : plan.price,
      })),
    [displayPlans, storePrices]
  );
  const pricedSelectedPlanItem = useMemo(
    () =>
      selectedPlanItem
        ? {
            ...selectedPlanItem,
            price: selectedPlanItem.id
              ? (storePrices[selectedPlanItem.id] ?? selectedPlanItem.price)
              : selectedPlanItem.price,
          }
        : null,
    [selectedPlanItem, storePrices]
  );

  const onCreateOrder = useCallback(() => {
    if (selectedPlanItem?.isFree) return;
    if (selectedPlanItem?.purchaseState === 'current') return;
    if (selectedPlanItem?.isCustom) {
      if (!navigationRef.isReady()) return;
      navigationRef.dispatch(
        CommonActions.navigate('App', {
          screen: 'Settings',
          params: { screen: 'SupportTickets' },
        })
      );
      return;
    }
    if (selectedPlanItem?.purchaseState === 'downgrade') {
      showConfirm({
        title: t('membership.downgrade_confirm_title'),
        message: t('membership.downgrade_confirm_message', {
          name: selectedPlanItem.name,
        }),
        confirmText: t('membership.cta_downgrade_plan', {
          name: selectedPlanItem.name,
        }),
        onConfirm: () => setIsCheckoutOpen(true),
      });
      return;
    }
    setIsCheckoutOpen(true);
  }, [selectedPlanItem, t]);

  const onConfirmCheckout = useCallback(
    async (gateway: PaymentGateway) => {
      const started = await handleCreateOrder(pricedSelectedPlanItem, gateway);
      if (started) {
        closeCheckout();
      }
    },
    [closeCheckout, handleCreateOrder, pricedSelectedPlanItem]
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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
            displayPlans={pricedDisplayPlans}
            featureRows={featureRows}
            selectedPlan={selectedPlan}
            selectedIndex={selectedIndex}
            onSelectPlan={setSelectedPlan}
            billingCycles={billingCycles}
            selectedBillingCycle={selectedBillingCycle}
            onSelectBillingCycle={setSelectedBillingCycle}
          />
        ) : (
          <AssistedTab
            displayPlans={pricedDisplayPlans}
            featureRows={featureRows}
            selectedPlan={selectedPlan}
            selectedIndex={selectedIndex}
            onSelectPlan={setSelectedPlan}
          />
        )}

        {boostPlan ? (
          <View
            style={[
              styles.boostCard,
              !canUseProfileBoost && styles.boostCardLocked,
            ]}
          >
            <View style={styles.boostIcon}>
              <Feather
                name={canUseProfileBoost ? 'zap' : 'lock'}
                size={18}
                color={theme.colors.primary}
              />
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
              onPress={
                canUseProfileBoost
                  ? onCreateBoostOrder
                  : () => showUpgradePrompt(t('membership.boost.title'))
              }
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
        selectedPlanItem={pricedSelectedPlanItem}
        isCreatingOrder={isCreatingOrder}
        isFetchingPlans={isFetchingPlans}
        onCreateOrder={onCreateOrder}
      />

      <PaymentOptionSheet
        visible={isCheckoutOpen}
        selectedPlanItem={pricedSelectedPlanItem}
        isCreatingOrder={isCreatingOrder}
        onClose={closeCheckout}
        onContinue={(gateway) => {
          void onConfirmCheckout(gateway);
        }}
      />
    </SafeAreaView>
  );
}
