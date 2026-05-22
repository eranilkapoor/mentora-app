import React, { useMemo } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { Theme } from '@/core/theme/types';

export interface SettingsOption<T extends string> {
  label: string;
  value: T;
  description?: string;
}

interface Props<T extends string> {
  visible: boolean;
  title: string;
  options: SettingsOption<T>[];
  selectedValue?: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: theme.colors.modalOverlay,
    },
    sheet: {
      maxHeight: '78%',
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      backgroundColor: theme.colors.surface,
      paddingTop: 12,
      paddingBottom: 20,
    },
    handle: {
      alignSelf: 'center',
      width: 42,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.divider,
      marginBottom: 12,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      paddingBottom: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    title: {
      flex: 1,
      fontSize: 17,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    closeButton: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 18,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    optionText: {
      flex: 1,
      marginRight: 12,
    },
    optionLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    optionDescription: {
      marginTop: 2,
      fontSize: 12,
      color: theme.colors.textMuted,
    },
  });

export function SettingsOptionSheet<T extends string>({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: Props<T>): React.ReactElement {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.backdrop}
        accessibilityRole="button"
        accessibilityLabel={t('common.close')}
        onPress={onClose}
      >
        <Pressable style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              onPress={onClose}
            >
              <Feather name="x" size={20} color={theme.colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((option) => {
              const selected = option.value === selectedValue;

              return (
                <Pressable
                  key={option.value}
                  style={styles.option}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                >
                  <View style={styles.optionText}>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                    {option.description ? (
                      <Text style={styles.optionDescription}>
                        {option.description}
                      </Text>
                    ) : null}
                  </View>
                  {selected ? (
                    <Feather
                      name="check"
                      size={18}
                      color={theme.colors.primary}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
