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
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { onboardingStyles } from '../Onboarding.styles';
import { ErrorText } from './ErrorText';
import { SearchMultiSelectProps } from '../Onboarding.types';

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
  const styles = useThemedStyles(onboardingStyles);
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);

  // ─── Filtered suggestions ────────────────────────────────────────────────

  const filteredOptions = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return options.slice(0, MAX_SUGGESTIONS);
    return options.filter((opt) => opt.label.toLowerCase().includes(trimmed));
  }, [query, options]);

  // ─── Label lookup ────────────────────────────────────────────────────────

  const getLabel = useCallback(
    (value: string) => options.find((o) => o.value === value)?.label ?? value,
    [options]
  );

  // ─── Handlers ────────────────────────────────────────────────────────────

  const addItem = useCallback(
    (value: string) => {
      if (!selected.includes(value)) {
        onChange([...selected, value]);
      }
      setQuery('');
    },
    [selected, onChange]
  );

  const removeItem = useCallback(
    (value: string) => {
      onChange(selected.filter((v) => v !== value));
      // If removing causes count to drop to ≤ MAX_VISIBLE, collapse
      if (selected.length - 1 <= MAX_VISIBLE) {
        setExpanded(false);
      }
    },
    [selected, onChange]
  );

  const toggleExpanded = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }, []);

  // ─── Chip visibility ──────────────────────────────────────────────────────

  const hasOverflow = selected.length > MAX_VISIBLE;
  const visibleChips = expanded ? selected : selected.slice(0, MAX_VISIBLE);
  const hiddenCount = selected.length - MAX_VISIBLE;

  // ─── Render ───────────────────────────────────────────────────────────────

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

      {/* Suggestions — only shown while typing */}
      {query.trim().length > 0 && (
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
                      isSelected && styles.dropdownItemActive,
                    ]}
                    onPress={() => addItem(item.value)}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                    accessibilityState={{ selected: isSelected }}
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

      {/* Selected chips + expand/collapse */}
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
                accessibilityLabel={`Remove ${getLabel(val)}`}
              >
                <Feather name="x" size={10} color={theme.colors.white} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Show more button */}
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

          {/* Show less button — only visible when expanded */}
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
