import React, { useCallback, useMemo, useState } from 'react';
import { TextInput, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '@/core/theme/ThemeProvider';

export interface TagInputProps {
  label: string;
  items?: string[];
  setItems: (v: string[]) => void;
  placeholder?: string;
}

export function TagInput({
  label,
  items,
  setItems,
  placeholder,
}: TagInputProps): React.ReactElement {
  const [text, setText] = useState<string>('');
  const { theme } = useTheme();
  
  const styles = StyleSheet.create({
    field: {
      marginBottom: 14,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 6,
    },
    tagInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    tagInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 11,
      fontSize: 15,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.inputBackground,
    },
    tagAddBtn: {
      width: 42,
      height: 42,
      borderRadius: 10,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tagList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 10,
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.colors.primaryLight,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    tagText: {
      fontSize: 13,
      color: theme.colors.primary,
      fontWeight: '500',
    },
  });

  const safeItems = useMemo<string[]>(() => items ?? [], [items]);

  const handleAdd = useCallback((): void => {
    const trimmed = text.trim();

    if (trimmed.length === 0) {
      return;
    }

    if (safeItems.includes(trimmed)) {
      return;
    }

    setItems([...safeItems, trimmed]);
    setText('');
  }, [safeItems, setItems, text]);

  const handleRemove = useCallback(
    (itemToRemove: string): void => {
      setItems(safeItems.filter((item) => item !== itemToRemove));
    },
    [safeItems, setItems]
  );

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View style={styles.tagInputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          style={styles.tagInput}
          onSubmitEditing={handleAdd}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          returnKeyType="done"
          accessibilityLabel={label}
        />

        <TouchableOpacity
          style={styles.tagAddBtn}
          onPress={handleAdd}
          accessibilityRole="button"
          accessibilityLabel={`Add ${label}`}
        >
          <Feather name="plus" size={18} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      {safeItems.length > 0 ? (
        <View style={styles.tagList}>
          {safeItems.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.tag}
              onPress={() => handleRemove(item)}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${item}`}
            >
              <Text style={styles.tagText}>{item}</Text>

              <Feather name="x" size={12} color={theme.colors.primary} />
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}
