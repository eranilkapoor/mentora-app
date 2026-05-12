import React from 'react';
import { ActivityIndicator, TouchableOpacity, View, Text, StyleSheet, Platform } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { SectionKey } from '../EditProfile.types';

export interface SectionCardProps {
  title: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  children: React.ReactNode;
  sectionKey: SectionKey;
  sectionLoading: SectionKey | null;
  onSave: (key: SectionKey) => void;
}

export function SectionCard({
  title,
  icon,
  children,
  sectionKey,
  sectionLoading,
  onSave,
}: SectionCardProps): React.ReactElement {
  const isSaving = sectionLoading === sectionKey;
  const { theme } = useTheme();
  const { t } = useTranslation();

  const styles = StyleSheet.create({
    sectionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginBottom: 16,
      overflow: 'hidden',
      ...(Platform.OS === 'ios' || Platform.OS === 'android'
        ? {
            boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.04)',
          }
        : {
            shadowColor: theme.colors.black,
            shadowOffset: {
              width: 0,
              height: 1,
            },
            shadowOpacity: 0.04,
            shadowRadius: 4,
          }),
      elevation: 1,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
      backgroundColor: theme.colors.surface,
    },
    sectionIconWrapper: {
      width: 26,
      height: 26,
      borderRadius: 7,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      flex: 1,
    },
    sectionBody: {
      padding: 16,
    },
    saveBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      margin: 16,
      marginTop: 4,
      backgroundColor: theme.colors.primary,
      paddingVertical: 13,
      borderRadius: 10,
    },
    saveBtnDisabled: {
      opacity: 0.6,
    },
    saveBtnText: {
      color: theme.colors.white,
      fontWeight: '700',
      fontSize: 15,
    },
  });


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
