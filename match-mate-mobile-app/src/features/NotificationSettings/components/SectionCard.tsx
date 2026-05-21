import React from 'react';
import { View, Text } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { useTheme } from '@/core/theme/ThemeProvider';
import { ToggleRow } from '@/core/components/ToggleRow';
import {
  NotificationGroup,
  NotificationState,
} from '../NotificationSettings.types';
import { notificationSettingsStyles } from '../NotificationSettings.styles';

interface Props {
  group: NotificationGroup;
  settings: NotificationState;
  onToggle: (key: string, val: boolean) => void;
  masterEnabled: boolean;
}

export function SectionCard({
  group,
  settings,
  onToggle,
  masterEnabled,
}: Props): React.ReactElement {
  const styles = useThemedStyles(notificationSettingsStyles);
  const { theme } = useTheme();

  return (
    <View style={styles.card}>
      {/* Section header */}
      <View style={styles.cardHeader}>
        <Text style={styles.sectionTitle}>{group.title}</Text>
        <Text style={styles.sectionSubtitle}>{group.subtitle}</Text>
      </View>

      {group.settings.map((setting, index) => {
        const isDisabled = !masterEnabled;
        const value = settings[setting.key] ?? true;

        return (
          <View key={setting.key}>
            {index > 0 && <View style={styles.rowDivider} />}

            <View style={styles.notifRow}>
              <View
                style={[
                  styles.rowIconWrapper,
                  isDisabled && styles.rowIconWrapperDisabled,
                ]}
              >
                <Feather
                  name={setting.icon as never}
                  size={16}
                  color={
                    isDisabled ? theme.colors.textMuted : theme.colors.primary
                  }
                />
              </View>

              <View style={styles.toggleWrapper}>
                <ToggleRow
                  label={setting.label}
                  sublabel={setting.description}
                  value={value}
                  onChange={(val) => onToggle(setting.key, val)}
                  disabled={isDisabled}
                  enableRowPress
                  size="medium"
                  containerStyle={{ marginBottom: 0 }}
                  rowStyle={{ paddingRight: 14 }}
                />
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}
