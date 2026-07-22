import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
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

const formatDateTime = (value: string | undefined, t: TFunction): string => {
  if (!value) return t('common.not_available');

  return new Date(value).toLocaleString();
};

const getDeviceLabel = (session: LoginHistoryItem, t: TFunction): string => {
  if (session.device) return session.device;
  if (session.userAgent?.includes('Android'))
    return t('settings.security.device_android');
  if (session.userAgent?.includes('iPhone'))
    return t('settings.security.device_iphone');
  if (session.userAgent?.includes('Windows'))
    return t('settings.security.device_windows');
  if (session.userAgent?.includes('Mac'))
    return t('settings.security.device_mac');

  return t('settings.security.device_unknown');
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
  t,
}: {
  session: LoginHistoryItem;
  isLast: boolean;
  onRevoke: (session: LoginHistoryItem) => void;
  t: TFunction;
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
          <Text style={styles.title}>{getDeviceLabel(session, t)}</Text>
          <View style={[styles.badge, isActive && styles.badgeActive]}>
            <Text
              style={[styles.badgeText, isActive && styles.badgeTextActive]}
            >
              {session.status.replace(/_/g, ' ')}
            </Text>
          </View>
        </View>
        <Text style={styles.meta}>
          {t('settings.security.signed_in')}{' '}
          {formatDateTime(session.signedInAt, t)}
        </Text>
        <View style={styles.detailGrid}>
          <DetailChip
            label={t('settings.security.last_active')}
            value={formatDateTime(session.lastActiveAt, t)}
          />
          <DetailChip
            label={t('settings.security.ip_address')}
            value={session.ip ?? t('common.not_available')}
          />
          <DetailChip
            label={t('settings.security.expires')}
            value={formatDateTime(session.expiresAt, t)}
          />
          <DetailChip
            label={
              session.loggedOutAt
                ? t('settings.security.signed_out')
                : t('settings.security.session')
            }
            value={
              session.loggedOutAt
                ? formatDateTime(session.loggedOutAt, t)
                : session.isActive
                  ? t('settings.security.currently_active')
                  : t('settings.security.inactive')
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
            <Text style={styles.revokeText}>
              {t('settings.security.sign_out_this_session')}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

function ActivityRow({
  item,
  isLast,
  t,
}: {
  item: LoginActivityItem;
  isLast: boolean;
  t: TFunction;
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
        <Text style={styles.meta}>{formatDateTime(item.createdAt, t)}</Text>
        <Text style={styles.activityMeta}>
          {[item.platform, item.ip, item.device].filter(Boolean).join(' / ') ||
            t('settings.security.no_device_details_available')}
        </Text>
      </View>
    </View>
  );
}

export default function LoginHistoryScreen({
  navigation,
}: Props): React.ReactElement {
  const styles = useThemedStyles(loginHistoryStyles);
  const { t } = useTranslation();
  const { data, isLoading, refetch } = useGetLoginHistoryQuery();
  const [revokeSession] = useRevokeSessionMutation();

  if (isLoading || !data) {
    return <Loader fullScreen size="large" />;
  }

  const handleRevokeSession = (session: LoginHistoryItem): void => {
    showConfirm({
      title: t('settings.security.sign_out_session_title'),
      message: t('settings.security.sign_out_session_message'),
      confirmText: t('settings.security.sign_out_session_confirm'),
      destructive: true,
      onConfirm: () => {
        void revokeSession({ sessionId: session.sessionId })
          .unwrap()
          .then(() => {
            showSuccess({ title: t('settings.security.session_signed_out') });
            void refetch();
          })
          .catch(() => {
            showError({
              title: t('settings.security.unable_sign_out_session_title'),
              message: t('settings.security.unable_sign_out_session_message'),
            });
          });
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Header
        showBack
        onBackPress={navigation.goBack}
        title={t('settings.security.login_history_title')}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.overview}>
          <OverviewTile
            icon="activity"
            value={data.sessions.filter((session) => session.isActive).length}
            label={t('settings.security.active_sessions')}
            active
          />
          <OverviewTile
            icon="clock"
            value={data.sessions.length}
            label={t('settings.security.total_records')}
          />
          <OverviewTile
            icon="globe"
            value={
              data.sessions[0]?.ip
                ? data.sessions[0].ip.split('.').slice(0, 2).join('.') + '.*'
                : '--'
            }
            label={t('settings.security.latest_ip')}
          />
        </View>

        <SettingsCard
          icon="clock"
          title={t('settings.security.recent_signins')}
          subtitle={t('settings.security.recent_signins_sub')}
        >
          <SettingsSelectItem
            icon="refresh-cw"
            label={t('settings.security.refresh_history')}
            sublabel={t('settings.security.refresh_history_sub')}
            onPress={() => void refetch()}
          />
          {data.sessions.length ? (
            data.sessions.map((session, index) => (
              <HistoryRow
                key={session.sessionId}
                session={session}
                isLast={index === data.sessions.length - 1}
                onRevoke={handleRevokeSession}
                t={t}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>
              {t('settings.security.no_login_history')}
            </Text>
          )}
        </SettingsCard>

        <SettingsCard
          icon="shield"
          title={t('settings.security.security_timeline')}
          subtitle={t('settings.security.security_timeline_sub')}
        >
          {data.timeline.length ? (
            data.timeline.map((item, index) => (
              <ActivityRow
                key={item.id}
                item={item}
                isLast={index === data.timeline.length - 1}
                t={t}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>
              {t('settings.security.no_security_activity')}
            </Text>
          )}
        </SettingsCard>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}
