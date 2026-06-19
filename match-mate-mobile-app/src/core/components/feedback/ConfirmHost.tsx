import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';
import { applyAccessibilityToStyles } from '@/core/theme/accessibilityStyles';
import { Theme } from '@/core/theme/types';
import { ConfirmOptions, registerConfirmPresenter } from '@/core/utils/confirm';

export default function ConfirmHost(): React.ReactElement | null {
  const { theme, fontScale, accessibility, reduceAnimations } = useTheme();
  const styles = useMemo(
    () =>
      applyAccessibilityToStyles(
        makeStyles(theme),
        fontScale,
        accessibility.boldText
      ),
    [accessibility.boldText, fontScale, theme]
  );
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    registerConfirmPresenter(setOptions);
    return () => registerConfirmPresenter(null);
  }, []);

  const close = useCallback(() => {
    if (isBusy) return;
    options?.onCancel?.();
    setOptions(null);
  }, [isBusy, options]);

  const confirm = useCallback(async () => {
    if (!options || isBusy) return;
    setIsBusy(true);
    try {
      await options.onConfirm?.();
      setOptions(null);
    } finally {
      setIsBusy(false);
    }
  }, [isBusy, options]);

  if (!options) return null;

  const accent = options.destructive
    ? theme.colors.error
    : theme.colors.primary;
  const accentLight = options.destructive
    ? theme.colors.errorLight
    : theme.colors.primaryLight;

  return (
    <Modal
      transparent
      visible
      animationType={reduceAnimations ? 'none' : 'fade'}
      statusBarTranslucent
      onRequestClose={close}
    >
      <Pressable style={styles.overlay} onPress={close}>
        <Pressable style={styles.card}>
          <View style={styles.handle} />
          <View style={[styles.iconWrap, { backgroundColor: accentLight }]}>
            <Feather
              name={options.destructive ? 'alert-triangle' : 'shield'}
              size={22}
              color={accent}
            />
          </View>

          <Text style={styles.title}>{options.title}</Text>
          {options.message ? (
            <Text style={styles.message}>{options.message}</Text>
          ) : null}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={close}
              disabled={isBusy}
              accessibilityRole="button"
              accessibilityLabel={options.cancelText ?? 'Cancel'}
            >
              <Text style={styles.cancelText}>
                {options.cancelText ?? 'Cancel'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: accent },
                isBusy && styles.disabledButton,
              ]}
              onPress={() => {
                void confirm();
              }}
              disabled={isBusy}
              accessibilityRole="button"
              accessibilityLabel={options.confirmText ?? 'Confirm'}
            >
              <Text style={styles.confirmText}>
                {isBusy ? 'Please wait...' : (options.confirmText ?? 'Confirm')}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: theme.colors.modalOverlay,
    },
    card: {
      width: '100%',
      maxWidth: 420,
      borderRadius: 8,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 18,
      backgroundColor: theme.colors.surfaceElevated,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      shadowColor: theme.colors.black,
      shadowOpacity: 0.2,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 10,
    },
    handle: {
      alignSelf: 'center',
      width: 44,
      height: 4,
      borderRadius: 2,
      marginBottom: 16,
      backgroundColor: theme.colors.divider,
    },
    iconWrap: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      lineHeight: 24,
    },
    message: {
      marginTop: 8,
      fontSize: 14,
      color: theme.colors.textBody,
      lineHeight: 21,
    },
    actions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 22,
    },
    button: {
      flex: 1,
      minHeight: 44,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
    },
    cancelButton: {
      backgroundColor: theme.colors.backgroundLight,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
    },
    confirmButton: {
      shadowColor: theme.colors.black,
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    disabledButton: {
      opacity: 0.72,
    },
    cancelText: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.colors.textSecondary,
    },
    confirmText: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.colors.white,
    },
  });
