import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { matchListStyles } from '../MatchList.styles';
import { TabConfig, TabKey } from '../MatchList.types';

interface Props {
  tabs: TabConfig[];
  activeTab: TabKey;
  onTabChange: (key: TabKey) => void;
}

export function MatchTabs({
  tabs,
  activeTab,
  onTabChange,
}: Props): React.ReactElement {
  const styles = useThemedStyles(matchListStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.tabsWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScroll}
      >
        {tabs.map((tab) => {
          const selected = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, selected && styles.tabActive]}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
            >
              <Feather
                name={tab.icon as never}
                size={13}
                color={
                  selected ? theme.colors.white : theme.colors.textSecondary
                }
              />
              <Text style={[styles.tabText, selected && styles.tabTextActive]}>
                {t(tab.labelKey)}
              </Text>
              {tab.count > 0 && (
                <View
                  style={[styles.tabBadge, selected && styles.tabBadgeActive]}
                >
                  <Text
                    style={[
                      styles.tabBadgeText,
                      selected && styles.tabBadgeTextActive,
                    ]}
                  >
                    {tab.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
