import React, { useCallback, useState } from 'react';
import { TextInput, TouchableOpacity, View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useTheme } from '@/core/theme/ThemeProvider';
import { TagInputProps } from '../EditProfile.types';
import { editProfileStyles } from '../EditProfile.styles';

export function TagInput({
  label,
  items,
  setItems,
  placeholder,
}: TagInputProps): React.ReactElement {
  const [text, setText] = useState('');
  const styles = useThemedStyles(editProfileStyles);
  const { theme } = useTheme();

  // Guard against undefined items throughout
  const safeItems = items ?? [];

  const handleAdd = useCallback((): void => {
    const trimmed = text.trim();
    if (trimmed === '' || safeItems.includes(trimmed)) return;
    setItems([...safeItems, trimmed]);
    setText('');
  }, [text, safeItems, setItems]);

  const handleRemove = useCallback(
    (item: string): void => {
      setItems(safeItems.filter((i) => i !== item));
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

      {safeItems.length > 0 && (
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
      )}
    </View>
  );
}
