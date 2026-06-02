import React, { useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Header from '@/core/components/Header';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { membershipStyles } from './Membership.styles';
import { MembershipTab } from './Membership.types';
import { useMembershipData } from './hooks/useMembershipData';
import { useMembershipActions } from './hooks/useMembershipActions';
import { MembershipHeroCard } from './components/MembershipHeroCard';
import { SelfServiceTab } from './components/SelfServiceTab';
import { AssistedTab } from './components/AssistedTab';
import { MembershipCta } from './components/MembershipCta';
import { MEMBERSHIP_TABS } from './Membership.constants';

export default function MembershipScreen(): React.ReactElement {
  const styles = useThemedStyles(membershipStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<MembershipTab>('self');

  const {
    displayPlans,
    featureRows,
    selectedPlan,
    setSelectedPlan,
    selectedPlanItem,
    selectedIndex,
    activePlanName = 'Free',
    isFetchingPlans,
  } = useMembershipData(activeTab);

  const { handleCreateOrder, isCreatingOrder } = useMembershipActions();

  const onCreateOrder = useCallback(() => {
    void handleCreateOrder(selectedPlanItem);
  }, [handleCreateOrder, selectedPlanItem]);

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
      </ScrollView>

      {/* ── Sticky CTA ─────────────────────────────────────────────── */}
      <MembershipCta
        tab={activeTab}
        selectedPlanItem={selectedPlanItem}
        isCreatingOrder={isCreatingOrder}
        isFetchingPlans={isFetchingPlans}
        onCreateOrder={onCreateOrder}
      />
    </SafeAreaView>
  );
}
