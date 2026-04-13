import { useThemedStyles } from '@/core/theme/useThemedStyles';
import {
  NotificationGroup,
  NotificationState,
} from '../NotificationSettings.types';
import { notificationSettingsStyles } from '../NotificationSettingsScreen.styles';
import { View, Text } from 'react-native';
import { ToggleRow } from './ToggleRow';

export function SectionCard({
  group,
  settings,
  onToggle,
  masterEnabled,
}: {
  group: NotificationGroup;
  settings: NotificationState;
  onToggle: (key: string, val: boolean) => void;
  masterEnabled: boolean;
}): React.ReactElement {
  const styles = useThemedStyles(notificationSettingsStyles);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.sectionTitle}>{group.title}</Text>
        <Text style={styles.sectionSubtitle}>{group.subtitle}</Text>
      </View>
      {group.settings.map((setting, index) => (
        <View key={setting.key}>
          {index > 0 && <View style={styles.rowDivider} />}
          <ToggleRow
            icon={setting.icon}
            label={setting.label}
            description={setting.description}
            value={settings[setting.key] ?? true}
            onValueChange={(val) => onToggle(setting.key, val)}
            disabled={!masterEnabled}
          />
        </View>
      ))}
    </View>
  );
}
