import { useCallback, useState } from 'react';
import { TagInputProps } from '../EditProfile.types';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { editProfileStyles } from '../EditProfileScreen.styles';
import { TextInput, TouchableOpacity, View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '@/core/constants/colors';

export function TagInput({
  label,
  items,
  setItems,
  placeholder,
}: TagInputProps): React.ReactElement {
  const [text, setText] = useState('');
  const styles = useThemedStyles(editProfileStyles);

  const handleAdd = useCallback((): void => {
    const trimmed = text.trim();
    if (trimmed === '' || items.includes(trimmed)) return;
    setItems([...items, trimmed]);
    setText('');
  }, [text, items, setItems]);

  const handleRemove = useCallback(
    (item: string): void => {
      setItems(items.filter((i) => i !== item));
    },
    [items, setItems]
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
          placeholder={placeholder ?? `Add ${label.toLowerCase()}...`}
          placeholderTextColor={Colors.textMuted}
          returnKeyType="done"
          accessibilityLabel={`Add ${label}`}
        />
        <TouchableOpacity
          style={styles.tagAddBtn}
          onPress={handleAdd}
          accessibilityRole="button"
          accessibilityLabel={`Add ${label} item`}
        >
          <Feather name="plus" size={18} color={Colors.white} />
        </TouchableOpacity>
      </View>
      {items.length > 0 && (
        <View style={styles.tagList}>
          {items.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.tag}
              onPress={() => handleRemove(item)}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${item}`}
            >
              <Text style={styles.tagText}>{item}</Text>
              <Feather name="x" size={12} color={Colors.primary} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}
