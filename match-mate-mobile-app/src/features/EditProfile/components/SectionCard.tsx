import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { SectionCardProps } from '../EditProfile.types';
import { editProfileStyles } from '../EditProfileScreen.styles';
import { ActivityIndicator, TouchableOpacity, View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '@/core/constants/colors';

export function SectionCard({
  title,
  icon,
  children,
  sectionKey,
  sectionLoading,
  onSave,
}: SectionCardProps): React.ReactElement {
  const isSaving = sectionLoading === sectionKey;
  const styles = useThemedStyles(editProfileStyles);

  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconWrapper}>
          <Feather name={icon} size={14} color={Colors.primary} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      <View style={styles.sectionBody}>{children}</View>

      <TouchableOpacity
        style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
        onPress={() => onSave(sectionKey)}
        disabled={isSaving}
        accessibilityRole="button"
        accessibilityLabel={`Save ${title}`}
      >
        {isSaving ? (
          <ActivityIndicator color={Colors.white} size="small" />
        ) : (
          <>
            <Feather name="check" size={15} color={Colors.white} />
            <Text style={styles.saveBtnText}>Save {title}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
