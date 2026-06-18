import React, { memo, useCallback, useMemo, useRef, useState } from 'react';

import {
  FlatList,
  Modal,
  Keyboard,
  Platform,
  Pressable,
  Dimensions,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';

import { useTranslation } from 'react-i18next';

import { useTheme } from '@/core/theme/ThemeProvider';
import { RequiredAsterisk } from '@/core/components/RequiredAsterisk';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface DropdownOption<T extends string = string> {
  label: string;
  value: T;
  disabled?: boolean;
  searchText?: string;
}

export interface DropdownPickerProps<T extends string = string> {
  // Data
  options: readonly DropdownOption<T>[];
  value?: T | null;

  // Events
  onChange: (value: T) => void;

  // Labels
  label?: string;
  placeholder?: string;

  // State
  disabled?: boolean;
  loading?: boolean;
  required?: boolean;

  // Validation
  error?: string;

  // Features
  searchable?: boolean;
  clearable?: boolean;

  // UI
  maxHeight?: number;

  // Customization
  containerStyle?: StyleProp<ViewStyle>;
  triggerStyle?: StyleProp<ViewStyle>;
  dropdownStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;

  // Accessibility
  accessibilityLabel?: string;

  // Icons
  leftIcon?: React.ReactNode;

  // Translation
  translateLabel?: boolean;

  // Empty State
  emptyText?: string;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

const normalizeSearchText = (value: unknown): string =>
  String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/_/g, ' ')
    .toLocaleLowerCase();

const getOptionSearchText = <T extends string>(
  option: DropdownOption<T>
): string =>
  normalizeSearchText(
    [option.label, option.value, option.searchText].join(' ')
  );

function DropdownPickerComponent<T extends string = string>({
  options,
  value,
  onChange,

  label,
  placeholder,

  disabled = false,
  loading = false,
  required = false,

  error,

  searchable = false,
  clearable = false,

  maxHeight = 260,

  containerStyle,
  triggerStyle,
  dropdownStyle,
  labelStyle,
  errorStyle,

  accessibilityLabel,

  leftIcon,

  translateLabel = false,

  emptyText,
}: DropdownPickerProps<T>): React.ReactElement {
  const { theme } = useTheme();

  const { t } = useTranslation();

  const wrapperRef = useRef<View>(null);

  const [visible, setVisible] = useState(false);

  const [search, setSearch] = useState('');
  const [dropdownFrame, setDropdownFrame] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // ───────────────────────────────────────────────────────────
  // Styles
  // ───────────────────────────────────────────────────────────

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          width: '100%',
          marginBottom: 16,

          // IMPORTANT
          overflow: 'visible',

          zIndex: visible ? 9999 : 1,
        },

        wrapper: {
          width: '100%',
          position: 'relative',

          overflow: 'visible',
        },

        labelRow: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 6,
        },

        label: {
          fontSize: 13,
          fontWeight: '600',
          color: theme.colors.textSecondary,
        },

        trigger: {
          minHeight: 52,

          borderWidth: 1,
          borderColor: error ? theme.colors.error : theme.colors.border,

          borderRadius: 12,

          backgroundColor: disabled
            ? theme.colors.backgroundLight
            : theme.colors.inputBackground,

          paddingHorizontal: 14,
          paddingVertical: 12,

          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },

        triggerDisabled: {
          opacity: 0.6,
        },

        triggerContent: {
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
        },

        triggerActions: {
          flexDirection: 'row',
          alignItems: 'center',
        },

        triggerText: {
          flex: 1,

          fontSize: 15,
          color: theme.colors.textPrimary,
        },

        placeholder: {
          color: theme.colors.textMuted,
        },

        leftIcon: {
          marginRight: 10,
        },

        dropdown: {
          borderWidth: 1,
          borderColor: theme.colors.border,

          borderRadius: 12,

          backgroundColor: theme.colors.surface,

          overflow: 'hidden',

          maxHeight,

          shadowColor: theme.colors.black,
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,

          elevation: 8,

          zIndex: 99999,

          ...(Platform.OS === 'web'
            ? ({
                boxShadow: '0px 4px 12px rgba(0,0,0,0.10)',
              } as ViewStyle)
            : {}),
        },

        portalDropdown: {
          position: 'absolute',
        },

        searchInput: {
          height: 48,

          borderBottomWidth: StyleSheet.hairlineWidth,

          borderBottomColor: theme.colors.divider,

          paddingHorizontal: 14,

          fontSize: 15,
          color: theme.colors.textPrimary,
        },

        option: {
          minHeight: 48,

          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',

          paddingHorizontal: 14,
          paddingVertical: 12,
        },

        optionSelected: {
          backgroundColor: theme.colors.primaryLight,
        },

        optionDisabled: {
          opacity: 0.4,
        },

        optionText: {
          flex: 1,

          fontSize: 15,
          color: theme.colors.textPrimary,
        },

        optionTextSelected: {
          color: theme.colors.primary,
          fontWeight: '600',
        },

        divider: {
          height: StyleSheet.hairlineWidth,
          backgroundColor: theme.colors.divider,
        },

        error: {
          marginTop: 6,

          fontSize: 12,
          color: theme.colors.error,
        },

        empty: {
          padding: 20,
          alignItems: 'center',
        },

        emptyTextStyle: {
          fontSize: 14,
          color: theme.colors.textMuted,
        },

        clearButton: {
          marginRight: 10,
        },

        backdrop: {
          ...StyleSheet.absoluteFillObject,

          zIndex: 9999,
        },

        portalBackdrop: {
          flex: 1,
        },
      }),
    [theme, error, disabled, visible, maxHeight]
  );

  // ───────────────────────────────────────────────────────────
  // Selected Option
  // ───────────────────────────────────────────────────────────

  const selectedOption = useMemo(
    () => options.find((item) => item.value === value),
    [options, value]
  );

  // ───────────────────────────────────────────────────────────
  // Filtered Options
  // ───────────────────────────────────────────────────────────

  const filteredOptions = useMemo(() => {
    if (!searchable || !search.trim()) {
      return options;
    }

    const normalizedSearch = normalizeSearchText(search);

    return options.filter((item) =>
      getOptionSearchText(item).includes(normalizedSearch)
    );
  }, [options, search, searchable]);

  // ───────────────────────────────────────────────────────────
  // Handlers
  // ───────────────────────────────────────────────────────────

  const handleOpen = useCallback(() => {
    if (disabled || loading) {
      return;
    }

    Keyboard.dismiss();
    wrapperRef.current?.measureInWindow((x, y, width, height) => {
      setDropdownFrame({ x, y, width, height });
      setVisible(true);
    });
  }, [disabled, loading]);

  const handleClose = useCallback(() => {
    setVisible(false);
    setSearch('');
    setDropdownFrame(null);
  }, []);

  const handleSelect = useCallback(
    (item: DropdownOption<T>) => {
      if (item.disabled) {
        return;
      }

      onChange(item.value);

      handleClose();
    },
    [handleClose, onChange]
  );

  const handleClear = useCallback(() => {
    onChange('' as T);
  }, [onChange]);

  // ───────────────────────────────────────────────────────────
  // Render Item
  // ───────────────────────────────────────────────────────────

  const renderItem = useCallback(
    ({ item }: { item: DropdownOption<T> }) => {
      const isSelected = item.value === value;

      return (
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={item.disabled}
          accessibilityRole="button"
          accessibilityLabel={item.label}
          accessibilityState={{
            selected: isSelected,
            disabled: item.disabled,
          }}
          style={[
            styles.option,
            isSelected && styles.optionSelected,
            item.disabled && styles.optionDisabled,
          ]}
          onPress={() => handleSelect(item)}
        >
          <Text
            style={[styles.optionText, isSelected && styles.optionTextSelected]}
          >
            {translateLabel ? t(item.label) : item.label}
          </Text>

          {isSelected && (
            <Feather name="check" size={16} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      );
    },
    [handleSelect, styles, t, theme.colors.primary, translateLabel, value]
  );

  const dropdownContent = (
    <View
      style={[
        styles.dropdown,
        dropdownFrame && [
          styles.portalDropdown,
          {
            top: dropdownFrame.y + dropdownFrame.height + 4,
            left: dropdownFrame.x,
            width: dropdownFrame.width,
            maxHeight: Math.min(
              maxHeight,
              Math.max(
                160,
                Dimensions.get('window').height -
                  dropdownFrame.y -
                  dropdownFrame.height -
                  24
              )
            ),
          },
        ],
        dropdownStyle,
      ]}
    >
      {searchable && (
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t('common.search')}
          placeholderTextColor={theme.colors.textMuted}
          style={styles.searchInput}
          autoCorrect={false}
          autoCapitalize="none"
        />
      )}

      <FlatList
        data={filteredOptions}
        keyExtractor={(item) => item.value}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTextStyle}>
              {emptyText ?? t('common.no_results_found')}
            </Text>
          </View>
        }
      />
    </View>
  );

  // ───────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────

  return (
    <>
      <View ref={wrapperRef} style={[styles.container, containerStyle]}>
        {!!label && (
          <View style={styles.labelRow}>
            <Text style={[styles.label, labelStyle]}>{label}</Text>

            {required && <RequiredAsterisk />}
          </View>
        )}

        <View style={styles.wrapper}>
          <TouchableOpacity
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel ?? label}
            accessibilityState={{
              expanded: visible,
              disabled,
            }}
            style={[
              styles.trigger,
              disabled && styles.triggerDisabled,
              triggerStyle,
            ]}
            onPress={visible ? handleClose : handleOpen}
          >
            <View style={styles.triggerContent}>
              {leftIcon ? (
                <View style={styles.leftIcon}>{leftIcon}</View>
              ) : null}

              <Text
                numberOfLines={1}
                style={[
                  styles.triggerText,
                  !selectedOption && styles.placeholder,
                ]}
              >
                {selectedOption
                  ? translateLabel
                    ? t(selectedOption.label)
                    : selectedOption.label
                  : (placeholder ?? t('common.select_option'))}
              </Text>
            </View>

            <View style={styles.triggerActions}>
              {clearable && selectedOption ? (
                <TouchableOpacity
                  hitSlop={10}
                  style={styles.clearButton}
                  onPress={handleClear}
                >
                  <Feather name="x" size={16} color={theme.colors.textMuted} />
                </TouchableOpacity>
              ) : null}

              <Feather
                name={visible ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={theme.colors.textMuted}
              />
            </View>
          </TouchableOpacity>

          <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={handleClose}
          >
            <Pressable style={styles.portalBackdrop} onPress={handleClose}>
              {dropdownFrame ? dropdownContent : null}
            </Pressable>
          </Modal>
        </View>

        {!!error && <Text style={[styles.error, errorStyle]}>{error}</Text>}
      </View>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Memo
// ─────────────────────────────────────────────────────────────

DropdownPickerComponent.displayName = 'DropdownPicker';

export const DropdownPicker = memo(
  DropdownPickerComponent
) as typeof DropdownPickerComponent;
