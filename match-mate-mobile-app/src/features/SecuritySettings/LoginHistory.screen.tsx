import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import Header from '@/core/components/Header';
import Loader from '@/core/components/Loader';
import { SettingsCard } from '@/core/components/settings/SettingsCard';
import { SettingsSelectItem } from '@/core/components/settings/SettingsSelectItem';
import { useThemedStyles } from '@/core/theme/useThemedStyles';
import { SettingsNavigationProp } from '@/navigation/types';
import {
  useGetLoginHistoryQuery,
  useRevokeSessionMutation,
} from '@/store/services/securitySettingsApi.service';
import { LoginActivityItem, LoginHistoryItem } from './SecuritySettings.types';
import { loginHistoryStyles } from './LoginHistory.styles';
import { useTheme } from '@/core/theme/ThemeProvider';
import { showConfirm } from '@/core/utils/confirm';
import { showError, showSuccess } from '@/core/utils/toast';

type Props = {
  navigation: SettingsNavigationProp;
};

const formatDateTime = (value?: string): string => {
  if (!value) return 'Not available';

  return new Date(value).toLocaleString();
};

const getDeviceLabel = (session: LoginHistoryItem): string => {
  if (session.device) return session.device;
  if (session.userAgent?.includes('Android')) return 'Android device';
  if (session.userAgent?.includes('iPhone')) return 'iPhone';
  if (session.userAgent?.includes('Windows')) return 'Windows browser';
  if (session.userAgent?.includes('Mac')) return 'Mac browser';

  return 'Unknown device';
};

const getDeviceIcon = (
  session: LoginHistoryItem
): React.ComponentProps<typeof Feather>['name'] => {
  const label = `${session.device ?? ''} ${session.userAgent ?? ''}`;
  if (/android|iphone|mobile/i.test(label)) return 'smartphone';
  if (/windows|mac|linux|browser/i.test(label)) return 'monitor';

  return 'shield';
};

const formatActionLabel = (action?: string): string =>
  action
    ? action
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : 'Security activity';

const getActivityIcon = (
  action?: string
): React.ComponentProps<typeof Feather>['name'] => {
  if (action?.includes('suspicious')) return 'alert-triangle';
  if (action?.includes('logout') || action?.includes('revoked')) {
    return 'log-out';
  }
  if (action?.includes('refresh')) return 'refresh-cw';
  if (action?.includes('password')) return 'key';

  return 'shield';
};

function DetailChip({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.ReactElement {
  const styles = useThemedStyles(loginHistoryStyles);

  return (
    <View style={styles.detailChip}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function OverviewTile({
  icon,
  value,
  label,
  active,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  value: string | number;
  label: string;
  active?: boolean;
}): React.ReactElement {
  const styles = useThemedStyles(loginHistoryStyles);
  const { theme } = useTheme();

  return (
    <View style={styles.overviewTile}>
      <View style={styles.overviewIcon}>
        <Feather
          name={icon}
          size={15}
          color={active ? theme.colors.success : theme.colors.primary}
        />
      </View>
      <View>
        <Text style={styles.overviewValue}>{value}</Text>
        <Text style={styles.overviewLabel}>{label}</Text>
      </View>
    </View>
  );
}

function HistoryRow({
  session,
  isLast,
  onRevoke,
}: {
  session: LoginHistoryItem;
  isLast: boolean;
  onRevoke: (session: LoginHistoryItem) => void;
}): React.ReactElement {
  const styles = useThemedStyles(loginHistoryStyles);
  const { theme } = useTheme();
  const isActive = session.status === 'active';

  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <View style={styles.iconColumn}>
        <View style={styles.deviceIcon}>
          <Feather
            name={getDeviceIcon(session)}
            size={17}
            color={isActive ? theme.colors.success : theme.colors.primary}
          />
        </View>
        {!isLast ? <View style={styles.timelineLine} /> : null}
      </View>
      <View style={styles.rowContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{getDeviceLabel(session)}</Text>
          <View style={[styles.badge, isActive && styles.badgeActive]}>
            <Text
              style={[styles.badgeText, isActive && styles.badgeTextActive]}
            >
              {session.status.replace(/_/g, ' ')}
            </Text>
          </View>
        </View>
        <Text style={styles.meta}>
          Signed in {formatDateTime(session.signedInAt)}
        </Text>
        <View style={styles.detailGrid}>
          <DetailChip
            label="Last active"
            value={formatDateTime(session.lastActiveAt)}
          />
          <DetailChip
            label="IP address"
            value={session.ip ?? 'Not available'}
          />
          <DetailChip
            label="Expires"
            value={formatDateTime(session.expiresAt)}
          />
          <DetailChip
            label={session.loggedOutAt ? 'Signed out' : 'Session'}
            value={
              session.loggedOutAt
                ? formatDateTime(session.loggedOutAt)
                : session.isActive
                  ? 'Currently active'
                  : 'Inactive'
            }
          />
        </View>
        {session.isActive ? (
          <TouchableOpacity
            style={styles.revokeButton}
            onPress={() => onRevoke(session)}
            accessibilityRole="button"
          >
            <Feather name="log-out" size={14} color={theme.colors.error} />
            <Text style={styles.revokeText}>Sign out this session</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

function ActivityRow({
  item,
  isLast,
}: {
  item: LoginActivityItem;
  isLast: boolean;
}): React.ReactElement {
  const styles = useThemedStyles(loginHistoryStyles);
  const { theme } = useTheme();
  const isWarning = item.action === 'suspicious_login';

  return (
    <View style={[styles.activityRow, isLast && styles.rowLast]}>
      <View
        style={[styles.activityIcon, isWarning && styles.activityIconWarning]}
      >
        <Feather
          name={getActivityIcon(item.action)}
          size={15}
          color={isWarning ? theme.colors.warning : theme.colors.primary}
        />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.title}>{formatActionLabel(item.action)}</Text>
        <Text style={styles.meta}>{formatDateTime(item.createdAt)}</Text>
        <Text style={styles.activityMeta}>
          {[item.platform, item.ip, item.device].filter(Boolean).join(' / ') ||
            'No device details available'}
        </Text>
      </View>
    </View>
  );
}

export default function LoginHistoryScreen({
  navigation,
}: Props): React.ReactElement {
  const styles = useThemedStyles(loginHistoryStyles);
  const { data, isLoading, refetch } = useGetLoginHistoryQuery();
  const [revokeSession] = useRevokeSessionMutation();

  if (isLoading || !data) {
    return <Loader fullScreen size="large" />;
  }

  const handleRevokeSession = (session: LoginHistoryItem): void => {
    showConfirm({
      title: 'Sign out session?',
      message: 'This device will need to log in again.',
      confirmText: 'Sign out',
      destructive: true,
      onConfirm: () => {
        void revokeSession({ sessionId: session.sessionId })
          .unwrap()
          .then(() => {
            showSuccess({ title: 'Session signed out' });
            void refetch();
          })
          .catch(() => {
            showError({
              title: 'Unable to sign out session',
              message: 'Please try again.',
            });
          });
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header showBack onBackPress={navigation.goBack} title="Login History" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.overview}>
          <OverviewTile
            icon="activity"
            value={data.sessions.filter((session) => session.isActive).length}
            label="Active sessions"
            active
          />
          <OverviewTile
            icon="clock"
            value={data.sessions.length}
            label="Total records"
          />
          <OverviewTile
            icon="globe"
            value={
              data.sessions[0]?.ip
                ? data.sessions[0].ip.split('.').slice(0, 2).join('.') + '.*'
                : '--'
            }
            label="Latest IP"
          />
        </View>

        <SettingsCard
          icon="clock"
          title="Recent Sign-ins"
          subtitle="Review device, IP, and session activity for your account"
        >
          <SettingsSelectItem
            icon="refresh-cw"
            label="Refresh history"
            sublabel="Load the latest session activity"
            onPress={() => void refetch()}
          />
          {data.sessions.length ? (
            data.sessions.map((session, index) => (
              <HistoryRow
                key={session.sessionId}
                session={session}
                isLast={index === data.sessions.length - 1}
                onRevoke={handleRevokeSession}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No login history found.</Text>
          )}
        </SettingsCard>

        <SettingsCard
          icon="shield"
          title="Security Timeline"
          subtitle="Audit login, refresh, logout, and session security events"
        >
          {data.timeline.length ? (
            data.timeline.map((item, index) => (
              <ActivityRow
                key={item.id}
                item={item}
                isLast={index === data.timeline.length - 1}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No security activity found.</Text>
          )}
        </SettingsCard>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}
