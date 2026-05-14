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

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TagInputProps {
  label: string;
  value?: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  maxTags?: number;
  maxLength?: number;
  /** Convert every tag to lowercase before storing */
  lowercase?: boolean;
  /** When false (default), duplicate detection ignores case */
  caseSensitive?: boolean;
  allowDuplicates?: boolean;
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
  emptyMessage?: string;
  removable?: boolean;
}

const createStyles = (theme: Theme, hasError: boolean, disabled: boolean) =>
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
      borderColor: hasError ? theme.colors.error : theme.colors.border,
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
      alignItems: 'center',
      justifyContent: 'center',
    },
    addButtonEnabled: {
      backgroundColor: theme.colors.primary,
    },
    addButtonDisabled: {
      backgroundColor: theme.colors.border,
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
    },
    tagText: {
      fontSize: 13,
      color: theme.colors.primary,
      fontWeight: '500',
      flexShrink: 1,
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
    limitText: {
      marginTop: 6,
      fontSize: 12,
      color: theme.colors.textMuted,
    },
    dimmed: {
      opacity: 0.6,
    },
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
  const [text, setText] = useState('');

  const styles = useMemo(
    () => createStyles(theme, Boolean(error), disabled),
    [theme, error, disabled]
  );

  const tags = useMemo<string[]>(() => value ?? [], [value]);

  const normalizedInput = useMemo(() => {
    const trimmed = text.trim();
    return lowercase ? trimmed.toLowerCase() : trimmed;
  }, [text, lowercase]);

  const canAddMore = maxTags === undefined || tags.length < maxTags;
  const atLimit = maxTags !== undefined && tags.length >= maxTags;

  // ─── Add ─────────────────────────────────────────────────────────────────

  const handleAdd = useCallback((): void => {
    if (disabled || normalizedInput.length === 0) return;
    if (normalizedInput.length > maxLength) return;
    if (!canAddMore) return;

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

    onChange([...tags, formatted]);
    onAddTag?.(formatted);
    setText('');
    inputRef.current?.focus();
  }, [
    disabled,
    normalizedInput,
    maxLength,
    canAddMore,
    formatTag,
    allowDuplicates,
    caseSensitive,
    tags,
    validateTag,
    onChange,
    onAddTag,
  ]);

  // ─── Remove ───────────────────────────────────────────────────────────────

  const handleRemove = useCallback(
    (index: number): void => {
      const removed = tags[index];
      if (removed === undefined) return;

      const next = tags.filter((_, i) => i !== index);
      onChange(next);
      onRemoveTag?.(removed, index);
    },
    [tags, onChange, onRemoveTag]
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  const isAddDisabled = disabled || normalizedInput.length === 0 || !canAddMore;

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

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Max tags reached hint */}
      {atLimit && (
        <Text style={styles.limitText}>
          {`Maximum ${maxTags} items reached`}
        </Text>
      )}

      {tags.length > 0 ? (
        <View style={styles.tagList}>
          {tags.map((tag, index) => (
            <TouchableOpacity
              key={`${tag}-${index}`}
              activeOpacity={removable && !disabled ? 0.7 : 1}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${tag}`}
              disabled={!removable || disabled}
              onPress={() => handleRemove(index)}
              style={[styles.tag, disabled && styles.dimmed, tagStyle]}
            >
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.tagText, tagTextStyle]}
              >
                {tag}
              </Text>
              {removable && (
                <Feather color={theme.colors.primary} name="x" size={12} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      ) : emptyMessage ? (
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      ) : null}
    </View>
  );
}

TagInputComponent.displayName = 'TagInput';

export const TagInput = React.memo(TagInputComponent);
