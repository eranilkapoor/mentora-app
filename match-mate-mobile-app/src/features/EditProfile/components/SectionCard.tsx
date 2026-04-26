import React from 'react';
import { ActivityIndicator, TouchableOpacity, View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useTheme } from '@/core/theme/ThemeProvider';
import { SectionCardProps } from '../EditProfile.types';
import { editProfileStyles } from '../EditProfile.styles';

export function SectionCard({
  title,
  icon,
  children,
  sectionKey,
  sectionLoading,
  onSave,
}: SectionCardProps): React.ReactElement {
  const isSaving = sectionLoading === sectionKey;
  const styles = useThemedStyles(editProfileStyles);
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
        accessibilityLabel={t('edit_profile.save_section', { section: title })}
      >
        {isSaving ? (
          <ActivityIndicator color={theme.colors.white} size="small" />
        ) : (
          <>
            <Feather name="check" size={15} color={theme.colors.white} />
            <Text style={styles.saveBtnText}>
              {t('edit_profile.save_section', { section: title })}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}