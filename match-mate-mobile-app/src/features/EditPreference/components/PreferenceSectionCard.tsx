import React from 'react';
import { ActivityIndicator, TouchableOpacity, View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useTheme } from '@/core/theme/ThemeProvider';
import { editPreferenceStyles } from '../EditPreference.styles';
import { PreferenceSectionKey } from '../EditPreference.types';

export interface SectionCardProps {
  title: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  children: React.ReactNode;
  sectionKey: PreferenceSectionKey;
  sectionLoading: PreferenceSectionKey | null;
  onSave: (key: PreferenceSectionKey) => void;
}

export function PreferenceSectionCard({
  title,
  icon,
  children,
  sectionKey,
  sectionLoading,
  onSave,
}: SectionCardProps): React.ReactElement {
  const isSaving = sectionLoading === sectionKey;
  const styles = useThemedStyles(editPreferenceStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconWrapper}>
          <Feather name={icon} size={14} color={theme.colors.primary} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      <View style={styles.sectionBody}>{children}</View>

      <TouchableOpacity
        style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
        onPress={() => onSave(sectionKey)}
        disabled={isSaving}
        accessibilityRole="button"
        accessibilityLabel={t('preference.save_section', { section: title })}
      >
        {isSaving ? (
          <ActivityIndicator color={theme.colors.white} size="small" />
        ) : (
          <>
            <Feather name="check" size={15} color={theme.colors.white} />
            <Text style={styles.saveBtnText}>
              {t('preference.save_section', { section: title })}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
