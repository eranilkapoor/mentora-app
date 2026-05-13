import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import { useTheme } from '@/core/theme/ThemeProvider';

export interface TagInputProps {
  label: string;

  /**
   * Controlled value
   */
  value?: string[];

  /**
   * Controlled updater
   */
  onChange: (items: string[]) => void;

  /**
   * Optional placeholder
   */
  placeholder?: string;

  /**
   * Optional helper text
   */
  helperText?: string;

  /**
   * Error message
   */
  error?: string;

  /**
   * Disable entire component
   */
  disabled?: boolean;

  /**
   * Maximum allowed tags
   */
  maxTags?: number;

  /**
   * Maximum characters per tag
   */
  maxLength?: number;

  /**
   * Auto lowercase tags
   */
  lowercase?: boolean;

  /**
   * Trim duplicate checks case insensitive
   */
  caseSensitive?: boolean;

  /**
   * Allow duplicate values
   */
  allowDuplicates?: boolean;

  /**
   * Called before adding tag
   */
  validateTag?: (tag: string) => boolean;

  /**
   * Custom formatter
   */
  formatTag?: (tag: string) => string;

  /**
   * Called when tag added
   */
  onAddTag?: (tag: string) => void;

  /**
   * Called when tag removed
   */
  onRemoveTag?: (tag: string) => void;

  /**
   * Input props passthrough
   */
  inputProps?: Omit<TextInputProps, 'value' | 'onChangeText'>;

  /**
   * Custom styles
   */
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  tagStyle?: StyleProp<ViewStyle>;
  tagTextStyle?: StyleProp<TextStyle>;

  /**
   * Accessibility
   */
  accessibilityLabel?: string;

  /**
   * Empty state
   */
  emptyMessage?: string;

  /**
   * Show remove icon
   */
  removable?: boolean;
}

export function TagInput({
  label,
  value,
  onChange,
  placeholder = 'Add item',
  helperText,
  error,
  disabled = false,
  maxTags,
  maxLength = 40,
  lowercase = false,
  caseSensitive = false,
  allowDuplicates = false,
  validateTag,
  formatTag,
  onAddTag,
  onRemoveTag,
  inputProps,
  containerStyle,
  inputStyle,
  tagStyle,
  tagTextStyle,
  accessibilityLabel,
  emptyMessage,
  removable = true,
}: TagInputProps): React.ReactElement {
  const { theme } = useTheme();

  const inputRef = useRef<TextInput>(null);

  const [text, setText] = useState<string>('');

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginBottom: 16,
        },

        label: {
          fontSize: 13,
          fontWeight: '600',
          color: theme.colors.textSecondary,
          marginBottom: 6,
        },

        helperText: {
          fontSize: 12,
          color: theme.colors.textMuted,
          marginBottom: 8,
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
          backgroundColor: disabled
            ? theme.colors.backgroundLight
            : theme.colors.inputBackground,
        },

        addButton: {
          width: 44,
          height: 44,
          borderRadius: 10,
          backgroundColor: disabled
            ? theme.colors.border
            : theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
        },

        tagList: {
          marginTop: 12,
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
        },

        tag: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: theme.colors.primaryLight,
          borderRadius: 20,
          paddingHorizontal: 12,
          paddingVertical: 7,
          maxWidth: '100%',
        },

        tagText: {
          fontSize: 13,
          color: theme.colors.primary,
          fontWeight: '500',
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

        disabled: {
          opacity: 0.6,
        },
      }),
    [theme, error, disabled]
  );

  const tags = useMemo<string[]>(() => value ?? [], [value]);

  const normalizedTags = useMemo<string[]>(
    () => (caseSensitive ? tags : tags.map((tag) => tag.toLowerCase())),
    [tags, caseSensitive]
  );

  const normalizedInput = useMemo<string>(() => {
    const trimmed = text.trim();

    return lowercase ? trimmed.toLowerCase() : trimmed;
  }, [text, lowercase]);

  const canAddMore = useMemo<boolean>(() => {
    if (maxTags === undefined) {
      return true;
    }

    return tags.length < maxTags;
  }, [maxTags, tags.length]);

  const clearInput = useCallback((): void => {
    setText('');
  }, []);

  const handleAdd = useCallback((): void => {
    if (disabled) {
      return;
    }

    if (normalizedInput.length === 0) {
      return;
    }

    if (normalizedInput.length > maxLength) {
      return;
    }

    const formattedTag = formatTag
      ? formatTag(normalizedInput)
      : normalizedInput;

    const compareValue = caseSensitive
      ? formattedTag
      : formattedTag.toLowerCase();

    const exists = normalizedTags.includes(compareValue);

    if (!allowDuplicates && exists) {
      return;
    }

    if (!canAddMore) {
      return;
    }

    if (validateTag && !validateTag(formattedTag)) {
      return;
    }

    const next = [...tags, formattedTag];

    onChange(next);

    onAddTag?.(formattedTag);

    clearInput();

    inputRef.current?.focus();
  }, [
    allowDuplicates,
    canAddMore,
    caseSensitive,
    clearInput,
    disabled,
    formatTag,
    maxLength,
    normalizedInput,
    normalizedTags,
    onAddTag,
    onChange,
    tags,
    validateTag,
  ]);

  const handleRemove = useCallback(
    (tagToRemove: string): void => {
      const next = tags.filter((tag) => tag !== tagToRemove);

      onChange(next);

      onRemoveTag?.(tagToRemove);
    },
    [onChange, onRemoveTag, tags]
  );

  const renderTag = useCallback(
    ({ item }: { item: string }) => (
      <TouchableOpacity
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${item}`}
        disabled={!removable || disabled}
        onPress={() => handleRemove(item)}
        style={[styles.tag, disabled && styles.disabled, tagStyle]}
      >
        <Text numberOfLines={1} style={[styles.tagText, tagTextStyle]}>
          {item}
        </Text>

        {removable ? (
          <Feather color={theme.colors.primary} name="x" size={12} />
        ) : null}
      </TouchableOpacity>
    ),
    [
      disabled,
      handleRemove,
      removable,
      styles.disabled,
      styles.tag,
      styles.tagText,
      tagStyle,
      tagTextStyle,
      theme.colors.primary,
    ]
  );

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>

      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}

      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          accessibilityLabel={accessibilityLabel ?? label}
          autoCapitalize="none"
          editable={!disabled}
          maxLength={maxLength}
          onChangeText={setText}
          onSubmitEditing={handleAdd}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          returnKeyType="done"
          style={[styles.input, inputStyle]}
          value={text}
          {...inputProps}
        />

        <TouchableOpacity
          accessibilityLabel={`Add ${label}`}
          accessibilityRole="button"
          activeOpacity={0.8}
          disabled={disabled || normalizedInput.length === 0 || !canAddMore}
          onPress={handleAdd}
          style={styles.addButton}
        >
          <Feather color={theme.colors.white} name="plus" size={18} />
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {tags.length > 0 ? (
        <FlatList
          contentContainerStyle={styles.tagList}
          data={tags}
          horizontal={false}
          keyExtractor={(item, index) => `${item}-${index}`}
          numColumns={3}
          renderItem={renderTag}
          scrollEnabled={false}
        />
      ) : emptyMessage ? (
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      ) : null}
    </View>
  );
}

TagInput.displayName = 'TagInput';
