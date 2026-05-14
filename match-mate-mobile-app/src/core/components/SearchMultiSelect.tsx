import React, { useCallback, useMemo, useState, forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/theme/ThemeProvider';
import { Theme } from '@/core/theme/types';

// ─── Enable LayoutAnimation on Android ───────────────────────────────────────

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OptionType {
  label: string;
  value: string;
}

export interface SearchMultiSelectProps {
  /** Field label shown above the input */
  label: string;
  /** Full list of available options */
  options: readonly OptionType[];
  /** Currently selected values */
  selected: string[];
  /** Called with the updated selected array on every change */
  onChange: (values: string[]) => void;
  /** Field key used to look up errors */
  field: string;
  /** Validation errors map */
  errors: Record<string, string>;
  /** Placeholder shown in the search input */
  placeholder?: string;
  /** How many chips to show before collapsing. Default: 2 */
  maxVisible?: number;
  /** Max suggestions shown in dropdown while typing. Default: 20 */
  maxSuggestions?: number;
  /** Passed through to the underlying TextInput */
  inputProps?: Omit<
    TextInputProps,
    | 'value'
    | 'onChangeText'
    | 'placeholder'
    | 'placeholderTextColor'
    | 'style'
    | 'accessibilityLabel'
    | 'returnKeyType'
  >;
}

// ─── Styles factory — called once per theme change, not per render ────────────

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginBottom: 4,
    },
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
      marginBottom: 4,
      fontSize: 15,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.inputBackground,
    },
    inputError: {
      borderColor: theme.colors.error,
      backgroundColor: theme.colors.errorLight,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginBottom: 8,
      marginTop: 2,
    },
    dropdown: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 10,
      marginBottom: 8,
      backgroundColor: theme.colors.surface,
      maxHeight: 220,
      shadowColor: theme.colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 4,
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
    dropdownItemSelected: {
      backgroundColor: theme.colors.primaryLight,
    },
    dropdownItemText: {
      fontSize: 14,
      color: theme.colors.textPrimary,
      flex: 1,
    },
    dropdownItemTextSelected: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.textMuted,
      paddingHorizontal: 14,
      paddingVertical: 13,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 6,
      marginBottom: 12,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.primaryBorder,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: theme.colors.primaryLight,
      gap: 5,
    },
    chipText: {
      fontSize: 13,
      color: theme.colors.primary,
      fontWeight: '500',
      flexShrink: 1,
    },
    chipRemove: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipOverflow: {
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
    chipOverflowText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
  });

// ─── Component ────────────────────────────────────────────────────────────────

function SearchMultiSelectComponent(
  {
    label,
    options,
    selected,
    onChange,
    field,
    errors,
    placeholder,
    maxVisible = 2,
    maxSuggestions = 20,
    inputProps,
  }: SearchMultiSelectProps,
  ref: React.ForwardedRef<TextInput>
): React.ReactElement {
  const { theme } = useTheme();
  const { t } = useTranslation();

  // Stable styles — only recreated when theme changes
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);

  // ─── Derived ───────────────────────────────────────────────────────────────

  const filteredOptions = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return options.slice(0, maxSuggestions);
    return options.filter((opt) => opt.label.toLowerCase().includes(trimmed));
  }, [query, options, maxSuggestions]);

  const getLabel = useCallback(
    (value: string): string =>
      options.find((o) => o.value === value)?.label ?? value,
    [options]
  );

  const hasOverflow = selected.length > maxVisible;
  const visibleChips = expanded ? selected : selected.slice(0, maxVisible);
  const hiddenCount = selected.length - maxVisible;

  // ─── Handlers ─────────────────────────────────────────────────────────────

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
      const next = selected.filter((v) => v !== value);
      onChange(next);
      // Auto-collapse if we're back within the visible threshold
      if (next.length <= maxVisible) {
        setExpanded(false);
      }
    },
    [selected, onChange, maxVisible]
  );

  const toggleExpanded = useCallback((): void => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }, []);

  // ─── Render ────────────────────────────────────────────────────────────────

  const errorMessage = errors[field];
  const showDropdown = query.trim().length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {/* Search input */}
      <TextInput
        ref={ref}
        value={query}
        onChangeText={setQuery}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.input, errorMessage ? styles.inputError : null]}
        accessibilityLabel={label}
        returnKeyType="done"
        onSubmitEditing={() => {
          // Auto-select first match on keyboard submit if exactly one result
          if (filteredOptions.length === 1 && filteredOptions[0]) {
            addItem(filteredOptions[0].value);
          }
        }}
        {...inputProps}
      />

      {/* Inline error */}
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      {/* Suggestions dropdown */}
      {showDropdown && (
        <View style={styles.dropdown}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((item) => {
                const isSelected = selected.includes(item.value);
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.dropdownItem,
                      isSelected && styles.dropdownItemSelected,
                    ]}
                    onPress={() => addItem(item.value)}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                    accessibilityState={{ selected: isSelected }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        isSelected && styles.dropdownItemTextSelected,
                      ]}
                      numberOfLines={1}
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
              <Text style={styles.emptyText}>
                {t('common.no_results_found')}
              </Text>
            )}
          </ScrollView>
        </View>
      )}

      {/* Selected chips */}
      {selected.length > 0 && (
        <View style={styles.chipRow}>
          {visibleChips.map((val) => (
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
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                accessibilityRole="button"
                accessibilityLabel={t('common.remove_item', {
                  item: getLabel(val),
                })}
                activeOpacity={0.8}
              >
                <Feather name="x" size={10} color={theme.colors.white} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Show more */}
          {hasOverflow && !expanded && (
            <TouchableOpacity
              style={styles.chipOverflow}
              onPress={toggleExpanded}
              accessibilityRole="button"
              accessibilityLabel={t('common.show_more_count', {
                count: hiddenCount,
              })}
              activeOpacity={0.7}
            >
              <Feather
                name="plus-circle"
                size={13}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.chipOverflowText}>
                {t('common.show_more_count', { count: hiddenCount })}
              </Text>
            </TouchableOpacity>
          )}

          {/* Show less */}
          {hasOverflow && expanded && (
            <TouchableOpacity
              style={styles.chipOverflow}
              onPress={toggleExpanded}
              accessibilityRole="button"
              accessibilityLabel={t('common.show_less')}
              activeOpacity={0.7}
            >
              <Feather
                name="chevron-up"
                size={13}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.chipOverflowText}>
                {t('common.show_less')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

SearchMultiSelectComponent.displayName = 'SearchMultiSelect';

export const SearchMultiSelect = React.memo(
  forwardRef(SearchMultiSelectComponent)
);
