import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
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
import { Theme } from '@/core/theme/types';
import { applyAccessibilityToStyles } from '@/core/theme/accessibilityStyles';
import { RemoveChipButton } from './RemoveChipButton';
import { RequiredAsterisk } from './RequiredAsterisk';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TagInputProps {
  label: string;
  value?: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  helperText?: string;
  error?: string;
  /** Fully disables interaction */
  disabled?: boolean;
  /** Allows disabling just the input while keeping tags visible */
  editable?: boolean;
  /** Shows a red asterisk after the label */
  required?: boolean;
  /** Max number of tags. Shows a count badge when set */
  maxTags?: number;
  /** Minimum character length before a tag can be added. Default: 1 */
  minLength?: number;
  maxLength?: number;
  lowercase?: boolean;
  caseSensitive?: boolean;
  allowDuplicates?: boolean;
  /** Trim whitespace before adding. Default: true */
  trimOnAdd?: boolean;
  /** Sort tags alphabetically after every add. Default: false */
  sortItems?: boolean;
  /** Submit input on keyboard return. Default: true */
  addOnSubmit?: boolean;
  removable?: boolean;
  validateTag?: (tag: string) => boolean;
  formatTag?: (tag: string) => string;
  onAddTag?: (tag: string) => void;
  onRemoveTag?: (tag: string, index: number) => void;
  inputProps?: Omit<TextInputProps, 'value' | 'onChangeText'>;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  tagStyle?: StyleProp<ViewStyle>;
  tagTextStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
  /** Shown when tag list is empty */
  emptyMessage?: string;
}

// ─── Styles factory ───────────────────────────────────────────────────────────

const createStyles = (theme: Theme, hasError: boolean, isDisabled: boolean) =>
  StyleSheet.create({
    container: { marginBottom: 16 },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    countText: {
      fontSize: 12,
      color: theme.colors.textMuted,
    },
    countAtLimit: {
      color: theme.colors.error,
      fontWeight: '600',
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
      borderColor: hasError ? theme.colors.error : theme.colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 11,
      fontSize: 15,
      color: theme.colors.textPrimary,
      minHeight: 52,
      backgroundColor: hasError
        ? theme.colors.errorLight
        : isDisabled
          ? theme.colors.backgroundLight
          : theme.colors.inputBackground,
    },
    addButton: {
      width: 44,
      height: 52,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addButtonEnabled: { backgroundColor: theme.colors.primary },
    addButtonDisabled: { backgroundColor: theme.colors.border },
    errorText: {
      marginTop: 6,
      fontSize: 12,
      color: theme.colors.error,
    },
    limitText: {
      marginTop: 6,
      fontSize: 12,
      color: theme.colors.textMuted,
    },
    emptyText: {
      marginTop: 10,
      fontSize: 12,
      color: theme.colors.textMuted,
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
      paddingLeft: 12,
      paddingRight: 8,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: theme.colors.primaryLight,
      borderWidth: 1,
      borderColor: theme.colors.primaryBorder,
    },
    tagText: {
      fontSize: 13,
      color: theme.colors.primary,
      fontWeight: '500',
      flexShrink: 1,
    },
    dimmed: { opacity: 0.5 },
  });

// ─── Component ────────────────────────────────────────────────────────────────

function TagInputComponent({
  label,
  value,
  onChange,
  placeholder = 'Add item',
  helperText,
  error,
  disabled = false,
  editable = true,
  required = false,
  maxTags,
  minLength = 1,
  maxLength = 40,
  lowercase = false,
  caseSensitive = false,
  allowDuplicates = false,
  trimOnAdd = true,
  sortItems = false,
  addOnSubmit = true,
  removable = true,
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
}: TagInputProps): React.ReactElement {
  const { theme, fontScale, accessibility } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [text, setText] = useState('');

  // Both disabled and editable=false lock the component
  const isDisabled = disabled || !editable;

  const styles = useMemo(
    () =>
      applyAccessibilityToStyles(
        createStyles(theme, Boolean(error), isDisabled),
        fontScale,
        accessibility.boldText
      ),
    [accessibility.boldText, error, fontScale, isDisabled, theme]
  );

  const tags = useMemo<string[]>(() => value ?? [], [value]);

  const normalizedInput = useMemo(() => {
    const trimmed = trimOnAdd ? text.trim() : text;
    return lowercase ? trimmed.toLowerCase() : trimmed;
  }, [text, trimOnAdd, lowercase]);

  const atLimit = maxTags !== undefined && tags.length >= maxTags;
  const canAdd =
    normalizedInput.length >= minLength &&
    normalizedInput.length <= maxLength &&
    !atLimit;

  // ─── Add ──────────────────────────────────────────────────────────────────

  const handleAdd = useCallback((): void => {
    if (isDisabled || !canAdd) return;

    const formatted = formatTag ? formatTag(normalizedInput) : normalizedInput;

    if (!allowDuplicates) {
      const exists = caseSensitive
        ? tags.includes(formatted)
        : tags.some((t) => t.toLowerCase() === formatted.toLowerCase());
      if (exists) {
        setText('');
        return;
      }
    }

    if (validateTag && !validateTag(formatted)) return;

    const next = [...tags, formatted];
    onChange(sortItems ? [...next].sort((a, b) => a.localeCompare(b)) : next);
    onAddTag?.(formatted);
    setText('');
    inputRef.current?.focus();
  }, [
    isDisabled,
    canAdd,
    formatTag,
    normalizedInput,
    allowDuplicates,
    caseSensitive,
    tags,
    validateTag,
    sortItems,
    onChange,
    onAddTag,
  ]);

  // ─── Remove by index — safe when allowDuplicates is true ─────────────────

  const handleRemove = useCallback(
    (index: number): void => {
      if (isDisabled) return;
      const removed = tags[index];
      if (removed === undefined) return;
      const next = tags.filter((_, i) => i !== index);
      onChange(next);
      onRemoveTag?.(removed, index);
    },
    [isDisabled, tags, onChange, onRemoveTag]
  );

  const isAddDisabled = isDisabled || !canAdd;

  return (
    <View style={[styles.container, containerStyle]}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={styles.headerRow}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required ? <RequiredAsterisk /> : null}
        </View>

        {/* Count badge — only shown when maxTags is set */}
        {maxTags !== undefined ? (
          <Text style={[styles.countText, atLimit && styles.countAtLimit]}>
            {tags.length}/{maxTags}
          </Text>
        ) : null}
      </View>

      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}

      {/* ── Input row ──────────────────────────────────────────────────── */}
      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          accessibilityLabel={accessibilityLabel ?? label}
          autoCapitalize="none"
          editable={!isDisabled}
          maxLength={maxLength}
          onChangeText={setText}
          onSubmitEditing={addOnSubmit ? handleAdd : undefined}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          returnKeyType="done"
          style={[styles.input, isDisabled && styles.dimmed, inputStyle]}
          value={text}
          {...inputProps}
        />

        <TouchableOpacity
          accessibilityLabel={`Add ${label}`}
          accessibilityRole="button"
          activeOpacity={0.8}
          disabled={isAddDisabled}
          onPress={handleAdd}
          style={[
            styles.addButton,
            isAddDisabled ? styles.addButtonDisabled : styles.addButtonEnabled,
          ]}
        >
          <Feather color={theme.colors.white} name="plus" size={18} />
        </TouchableOpacity>
      </View>

      {/* ── Feedback ───────────────────────────────────────────────────── */}
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : atLimit ? (
        <Text style={styles.limitText}>
          {`Maximum ${maxTags} items reached`}
        </Text>
      ) : null}

      {/* ── Tags ───────────────────────────────────────────────────────── */}
      {tags.length > 0 ? (
        <View style={styles.tagList}>
          {tags.map((tag, index) => (
            <View
              key={`${tag}-${index}`}
              style={[styles.tag, isDisabled && styles.dimmed, tagStyle]}
            >
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.tagText, tagTextStyle]}
              >
                {tag}
              </Text>
              {removable && (
                <RemoveChipButton
                  onPress={() => handleRemove(index)}
                  label={`Remove ${tag}`}
                  disabled={isDisabled}
                  size="sm"
                />
              )}
            </View>
          ))}
        </View>
      ) : emptyMessage ? (
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      ) : null}
    </View>
  );
}

export const TagInput = React.memo(TagInputComponent);
TagInput.displayName = 'TagInput';
