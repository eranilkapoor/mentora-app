import React, { memo, useMemo } from 'react';
import {
  ActivityIndicator,
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';

import { editPreferenceStyles } from '../EditPreference.styles';
import { PreferenceSectionKey } from '../EditPreference.types';

export interface PreferenceSectionCardProps<
  TSectionKey extends string = PreferenceSectionKey,
> {
  title: string;
  icon: React.ComponentProps<typeof Feather>['name'];

  children: React.ReactNode;

  sectionKey: TSectionKey;
  sectionLoading?: TSectionKey | null;

  onSave: (key: TSectionKey) => void;

  saveLabel?: string;
  hideSaveButton?: boolean;

  disabled?: boolean;
  loading?: boolean;

  containerStyle?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  saveButtonStyle?: StyleProp<ViewStyle>;

  testID?: string;
}

function PreferenceSectionCardComponent<
  TSectionKey extends string = PreferenceSectionKey,
>({
  title,
  icon = 'settings',
  children,
  sectionKey,
  sectionLoading,
  onSave,

  saveLabel,
  hideSaveButton = false,

  disabled = false,
  loading,

  containerStyle,
  bodyStyle,
  headerStyle,
  titleStyle,
  saveButtonStyle,

  testID,
}: PreferenceSectionCardProps<TSectionKey>): React.ReactElement {
  const styles = useThemedStyles(editPreferenceStyles);
  const { theme } = useTheme();
  const { t } = useTranslation();

  const isSaving = useMemo<boolean>(() => {
    if (typeof loading === 'boolean') {
      return loading;
    }

    return (
      sectionKey !== undefined &&
      sectionLoading !== null &&
      sectionLoading === sectionKey
    );
  }, [loading, sectionKey, sectionLoading]);

  const isDisabled = disabled || isSaving;

  const resolvedSaveLabel =
    saveLabel ??
    t('preference.save_section', {
      section: title,
    });

  return (
    <View
      style={[styles.sectionCard, containerStyle]}
      testID={testID}
      accessibilityRole="summary"
    >
      {/* Header */}
      <View style={[styles.sectionHeader, headerStyle]}>
        <View style={styles.sectionIconWrapper}>
          <Feather name={icon} size={14} color={theme.colors.primary} />
        </View>

        <Text style={[styles.sectionTitle, titleStyle]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Body */}
      <View style={[styles.sectionBody, bodyStyle]}>{children}</View>

      {/* Footer */}
      {!hideSaveButton && onSave ? (
        <TouchableOpacity
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityState={{
            disabled: isDisabled,
            busy: isSaving,
          }}
          accessibilityLabel={resolvedSaveLabel}
          disabled={isDisabled}
          onPress={() => onSave(sectionKey)}
          style={[
            styles.saveBtn,
            isDisabled && styles.saveBtnDisabled,
            saveButtonStyle,
          ]}
          testID={
            testID ? `${testID}-save-button` : 'preference-section-save-button'
          }
        >
          {isSaving ? (
            <ActivityIndicator color={theme.colors.white} size="small" />
          ) : (
            <>
              <Feather name="check" size={15} color={theme.colors.white} />

              <Text style={styles.saveBtnText}>{resolvedSaveLabel}</Text>
            </>
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

PreferenceSectionCardComponent.displayName = 'PreferenceSectionCard';

const PreferenceSectionCardMemo = memo(
  PreferenceSectionCardComponent
) as typeof PreferenceSectionCardComponent;

export const PreferenceSectionCard = PreferenceSectionCardMemo;
