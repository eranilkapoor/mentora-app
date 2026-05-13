import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';

import { useTheme } from '@/core/theme/ThemeProvider';

import { ErrorText } from './ErrorText';

export interface OptionType {
  label: string;
  value: string;
}

export interface SearchMultiSelectProps {
  label: string;

  options: readonly OptionType[];

  selected: string[];

  onChange: (values: string[]) => void;

  field: string;

  errors: Record<string, string>;

  placeholder?: string;
}

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MAX_VISIBLE = 2;

const MAX_SUGGESTIONS = 20;

export function SearchMultiSelect({
  label,
  options,
  selected,
  onChange,
  field,
  errors,
  placeholder,
}: SearchMultiSelectProps): React.ReactElement {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 13,
      marginBottom: 12,
      fontSize: 15,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.inputBackground,
    },
    inputError: {
      borderColor: theme.colors.error,
      backgroundColor: theme.colors.errorLight,
    },
    dropdown: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 10,
      marginBottom: 12,
      backgroundColor: theme.colors.surface,
      maxHeight: 220,
      // Fixed: boxShadow is CSS web-only — use RN shadow props
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 4,
    },
    dropdownPlaceholder: {
      color: theme.colors.textMuted,
      fontSize: 15,
    },
    dropdownItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 13,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.divider,
    },
    dropdownItemActive: {
      backgroundColor: theme.colors.primaryLight,
    },
    dropdownItemText: {
      fontSize: 15,
      color: theme.colors.textPrimary,
    },
    dropdownItemTextActive: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
      marginTop: 4,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: theme.colors.inputBackground,
      gap: 5,
    },
    chipActive: {
      backgroundColor: theme.colors.primaryLight,
      borderColor: theme.colors.primary,
    },
    chipText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    chipTextActive: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
    chipRemove: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipMore: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: theme.colors.backgroundLight,
      gap: 4,
    },
    chipMoreText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    chipShowLess: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: theme.colors.backgroundLight,
      gap: 4,
    },
  });

  const [query, setQuery] = useState('');

  const [expanded, setExpanded] = useState(false);

  const filteredOptions = useMemo(() => {
    const trimmed = query.trim().toLowerCase();

    if (!trimmed) {
      return options.slice(0, MAX_SUGGESTIONS);
    }

    return options.filter((opt: OptionType) =>
      opt.label.toLowerCase().includes(trimmed)
    );
  }, [query, options]);

  // ─── Label lookup ────────────────────────────────────

  const getLabel = useCallback(
    (value: string): string =>
      options.find((o: OptionType) => o.value === value)?.label ?? value,
    [options]
  );

  // ─── Handlers ────────────────────────────────────────

  const addItem = useCallback(
    (value: string): void => {
      if (!selected.includes(value)) {
        onChange([...selected, value]);
      }

      setQuery('');
    },
    [selected, onChange]
  );

  const removeItem = useCallback(
    (value: string): void => {
      onChange(selected.filter((v) => v !== value));

      if (selected.length - 1 <= MAX_VISIBLE) {
        setExpanded(false);
      }
    },
    [selected, onChange]
  );

  const toggleExpanded = useCallback((): void => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setExpanded((prev) => !prev);
  }, []);

  // ─── Chip visibility ─────────────────────────────────

  const hasOverflow = selected.length > MAX_VISIBLE;

  const visibleChips = expanded ? selected : selected.slice(0, MAX_VISIBLE);

  const hiddenCount = selected.length - MAX_VISIBLE;

  // ─── Render ──────────────────────────────────────────

  return (
    <View>
      <Text style={styles.label}>{label}</Text>

      {/* Search input */}
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.input, errors[field] ? styles.inputError : null]}
        accessibilityLabel={label}
        returnKeyType="done"
      />

      <ErrorText field={field} errors={errors} />

      {/* Suggestions */}
      {query.trim().length > 0 && (
        <View style={styles.dropdown}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((item: OptionType) => {
                const isSelected = selected.includes(item.value);

                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.dropdownItem,
                      isSelected && styles.dropdownItemActive,
                    ]}
                    onPress={() => addItem(item.value)}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                    accessibilityState={{
                      selected: isSelected,
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        isSelected && styles.dropdownItemTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>

                    {isSelected && (
                      <Feather
                        name="check"
                        size={14}
                        color={theme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.dropdownItem}>
                <Text style={styles.dropdownPlaceholder}>No results found</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* Selected chips */}
      {selected.length > 0 && (
        <View style={styles.chipRow}>
          {visibleChips.map((val: string) => (
            <View key={val} style={styles.chip}>
              <Text
                style={styles.chipText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {getLabel(val)}
              </Text>

              <TouchableOpacity
                onPress={() => removeItem(val)}
                style={styles.chipRemove}
                hitSlop={{
                  top: 6,
                  bottom: 6,
                  left: 6,
                  right: 6,
                }}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${getLabel(val)}`}
              >
                <Feather name="x" size={10} color={theme.colors.white} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Show more */}
          {hasOverflow && !expanded && (
            <TouchableOpacity
              style={styles.chipMore}
              onPress={toggleExpanded}
              accessibilityRole="button"
              accessibilityLabel={`Show ${hiddenCount} more`}
            >
              <Feather
                name="plus-circle"
                size={13}
                color={theme.colors.textSecondary}
              />

              <Text style={styles.chipMoreText}>{hiddenCount} more</Text>
            </TouchableOpacity>
          )}

          {/* Show less */}
          {hasOverflow && expanded && (
            <TouchableOpacity
              style={styles.chipShowLess}
              onPress={toggleExpanded}
              accessibilityRole="button"
              accessibilityLabel="Show less"
            >
              <Feather
                name="chevron-up"
                size={13}
                color={theme.colors.textSecondary}
              />

              <Text style={styles.chipMoreText}>Show less</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
