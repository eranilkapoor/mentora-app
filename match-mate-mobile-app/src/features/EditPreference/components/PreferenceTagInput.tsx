import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  StyleProp,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import { useTheme } from '@/core/theme/ThemeProvider';

export interface PreferenceTagInputProps {
  label: string;
  value?: string[];
  onChange: (items: string[]) => void;

  placeholder?: string;
  helperText?: string;
  error?: string;

  disabled?: boolean;
  editable?: boolean;
  required?: boolean;

  maxItems?: number;
  minLength?: number;
  maxLength?: number;

  allowDuplicates?: boolean;
  caseSensitive?: boolean;
  trimOnAdd?: boolean;
  sortItems?: boolean;

  addOnSubmit?: boolean;

  inputProps?: Omit<TextInputProps, 'value' | 'onChangeText'>;

  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  tagStyle?: StyleProp<ViewStyle>;

  emptyText?: string;
}

function PreferenceTagInputComponent({
  label,
  value = [],
  onChange,

  placeholder,
  helperText,
  error,

  disabled = false,
  editable = true,
  required = false,

  maxItems,
  minLength = 1,
  maxLength = 40,

  allowDuplicates = false,
  caseSensitive = false,
  trimOnAdd = true,
  sortItems = false,

  addOnSubmit = true,

  inputProps,

  containerStyle,
  inputStyle,
  tagStyle,

  emptyText,
}: PreferenceTagInputProps): React.ReactElement {
  const { theme } = useTheme();

  const [text, setText] = useState('');

  const isDisabled = disabled || !editable;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginBottom: 16,
        },

        headerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 6,
        },

        label: {
          fontSize: 13,
          fontWeight: '600',
          color: theme.colors.textSecondary,
        },

        required: {
          color: theme.colors.error,
        },

        countText: {
          fontSize: 12,
          color: theme.colors.textMuted,
        },

        inputRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        },

        input: {
          flex: 1,
          borderWidth: 1,
          borderColor: error ? theme.colors.error : theme.colors.border,
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 11,
          fontSize: 15,
          color: theme.colors.textPrimary,
          backgroundColor: error
            ? theme.colors.errorLight
            : theme.colors.inputBackground,
        },

        inputDisabled: {
          opacity: 0.5,
        },

        addButton: {
          width: 44,
          height: 44,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.primary,
        },

        addButtonDisabled: {
          opacity: 0.5,
        },

        helperText: {
          marginTop: 6,
          fontSize: 12,
          color: theme.colors.textMuted,
        },

        errorText: {
          marginTop: 6,
          fontSize: 12,
          color: theme.colors.error,
        },

        emptyText: {
          marginTop: 10,
          fontSize: 12,
          color: theme.colors.textMuted,
        },

        tagList: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
          marginTop: 12,
        },

        tag: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 12,
          paddingVertical: 7,
          borderRadius: 999,
          backgroundColor: theme.colors.primaryLight,
        },

        tagText: {
          fontSize: 13,
          fontWeight: '500',
          color: theme.colors.primary,
        },

        removeButton: {
          alignItems: 'center',
          justifyContent: 'center',
        },
      }),
    [theme, error]
  );

  const normalizedItems = useMemo(() => value.filter(Boolean), [value]);

  const normalizedInput = useMemo(() => {
    const input = trimOnAdd ? text.trim() : text;

    return caseSensitive ? input : input.toLowerCase();
  }, [caseSensitive, text, trimOnAdd]);

  const hasReachedMax =
    typeof maxItems === 'number' && normalizedItems.length >= maxItems;

  const canAdd =
    normalizedInput.length >= minLength &&
    normalizedInput.length <= maxLength &&
    !hasReachedMax;

  const itemExists = useCallback(
    (item: string): boolean => {
      if (allowDuplicates) {
        return false;
      }

      return normalizedItems.some((existing) => {
        if (caseSensitive) {
          return existing === item;
        }

        return existing.toLowerCase() === item.toLowerCase();
      });
    },
    [allowDuplicates, caseSensitive, normalizedItems]
  );

  const handleAdd = useCallback((): void => {
    if (isDisabled || !canAdd) {
      return;
    }

    const finalValue = trimOnAdd ? text.trim() : text;

    if (!finalValue) {
      return;
    }

    if (itemExists(finalValue)) {
      return;
    }

    const updatedItems = [...normalizedItems, finalValue];

    const finalItems = sortItems
      ? [...updatedItems].sort((a, b) => a.localeCompare(b))
      : updatedItems;

    onChange(finalItems);

    setText('');
  }, [
    canAdd,
    isDisabled,
    itemExists,
    normalizedItems,
    onChange,
    sortItems,
    text,
    trimOnAdd,
  ]);

  const handleRemove = useCallback(
    (itemToRemove: string): void => {
      if (isDisabled) {
        return;
      }

      const updatedItems = normalizedItems.filter(
        (item) => item !== itemToRemove
      );

      onChange(updatedItems);
    },
    [isDisabled, normalizedItems, onChange]
  );

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>
          {label}

          {required ? <Text style={styles.required}> *</Text> : null}
        </Text>

        {typeof maxItems === 'number' ? (
          <Text style={styles.countText}>
            {normalizedItems.length}/{maxItems}
          </Text>
        ) : null}
      </View>

      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          editable={!isDisabled}
          onSubmitEditing={addOnSubmit ? handleAdd : undefined}
          returnKeyType="done"
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          autoCapitalize="words"
          autoCorrect={false}
          accessibilityLabel={label}
          style={[styles.input, isDisabled && styles.inputDisabled, inputStyle]}
          {...inputProps}
        />

        <TouchableOpacity
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Add ${label}`}
          disabled={!canAdd || isDisabled}
          onPress={handleAdd}
          style={[
            styles.addButton,
            (!canAdd || isDisabled) && styles.addButtonDisabled,
          ]}
        >
          <Feather name="plus" size={18} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}

      {normalizedItems.length === 0 && emptyText ? (
        <Text style={styles.emptyText}>{emptyText}</Text>
      ) : null}

      {normalizedItems.length > 0 ? (
        <View style={styles.tagList}>
          {normalizedItems.map((item) => (
            <TouchableOpacity
              key={item}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${item}`}
              disabled={isDisabled}
              onPress={() => handleRemove(item)}
              style={[styles.tag, tagStyle]}
            >
              <Text style={styles.tagText}>{item}</Text>

              <View style={styles.removeButton}>
                <Feather name="x" size={12} color={theme.colors.primary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}

PreferenceTagInputComponent.displayName = 'PreferenceTagInput';

export const PreferenceTagInput = memo(
  PreferenceTagInputComponent
) as typeof PreferenceTagInputComponent;
