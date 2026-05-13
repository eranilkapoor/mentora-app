import React, { memo, useMemo } from 'react';
import {
  ActivityIndicator,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Platform,
  ViewStyle,
  StyleProp,
  TextStyle,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/core/theme/ThemeProvider';
import { SectionKey } from '../EditProfile.types';

export interface SectionCardProps {
  title: string;
  icon?: React.ComponentProps<typeof Feather>['name'];
  children: React.ReactNode;

  // Save Handling
  sectionKey: SectionKey;
  loadingKey?: SectionKey | null;
  onSave?: (key: SectionKey) => void;

  // UX
  saveLabel?: string;
  loadingLabel?: string;
  disabled?: boolean;
  hideSaveButton?: boolean;

  // Layout
  footer?: React.ReactNode;
  rightContent?: React.ReactNode;

  // Styling
  style?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;

  // Accessibility
  accessibilityLabel?: string;
}

function SectionCardComponent({
  title,
  icon,
  children,
  sectionKey,
  loadingKey,
  onSave,
  saveLabel,
  loadingLabel,
  disabled = false,
  hideSaveButton = false,
  footer,
  rightContent,
  style,
  bodyStyle,
  titleStyle,
  accessibilityLabel,
}: SectionCardProps): React.ReactElement {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const isSaving = loadingKey === sectionKey;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: theme.colors.surface,
          borderRadius: 16,
          marginBottom: 16,
          overflow: 'hidden',

          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.06,
              shadowRadius: 8,
            },
            android: {
              elevation: 2,
            },
            default: {},
          }),
        },

        header: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.colors.divider,
          backgroundColor: theme.colors.surface,
        },

        iconWrapper: {
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: theme.colors.primaryLight,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 10,
        },

        title: {
          flex: 1,
          fontSize: 15,
          fontWeight: '700',
          color: theme.colors.textSecondary,
          letterSpacing: 0.3,
        },

        body: {
          padding: 16,
        },

        footer: {
          paddingHorizontal: 16,
          paddingBottom: 16,
        },

        saveButton: {
          minHeight: 48,
          borderRadius: 12,
          backgroundColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          paddingHorizontal: 16,
        },

        saveButtonDisabled: {
          opacity: 0.6,
        },

        saveButtonText: {
          color: theme.colors.white,
          fontSize: 15,
          fontWeight: '700',
          marginLeft: 8,
        },
      }),
    [theme]
  );

  return (
    <View style={[styles.card, style]}>
      {/* Header */}
      <View style={styles.header}>
        {icon ? (
          <View style={styles.iconWrapper}>
            <Feather name={icon} size={16} color={theme.colors.primary} />
          </View>
        ) : null}

        <Text style={[styles.title, titleStyle]} accessibilityRole="header">
          {title}
        </Text>

        {rightContent}
      </View>

      {/* Body */}
      <View style={[styles.body, bodyStyle]}>{children}</View>

      {/* Custom Footer */}
      {footer ? <View style={styles.footer}>{footer}</View> : null}

      {/* Default Save Button */}
      {!hideSaveButton && onSave ? (
        <View style={styles.footer}>
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={disabled || isSaving}
            onPress={() => onSave?.(sectionKey)}
            accessibilityRole="button"
            accessibilityLabel={
              accessibilityLabel ??
              t('edit_profile.save_section', {
                section: title,
              })
            }
            style={[
              styles.saveButton,
              (disabled || isSaving) && styles.saveButtonDisabled,
            ]}
          >
            {isSaving ? (
              <>
                <ActivityIndicator size="small" color={theme.colors.white} />

                <Text style={styles.saveButtonText}>
                  {loadingLabel ?? t('common.saving')}
                </Text>
              </>
            ) : (
              <>
                <Feather name="check" size={16} color={theme.colors.white} />

                <Text style={styles.saveButtonText}>
                  {saveLabel ??
                    t('edit_profile.save_section', {
                      section: title,
                    })}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

export const SectionCard = memo(SectionCardComponent);
