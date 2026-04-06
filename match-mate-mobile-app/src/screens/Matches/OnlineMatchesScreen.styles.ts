import { Theme } from '@/core/theme/types';
import { StyleSheet } from 'react-native';

export const onlineMatchesStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },

    // Header
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.white,
      borderBottomWidth: 1,
      borderColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    headerSub: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
    onlineCountText: { color: theme.colors.primary, fontWeight: '700' },
    liveIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: theme.colors.primaryLight,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    liveDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: theme.colors.primary,
    },
    liveText: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.colors.primary,
      letterSpacing: 1,
    },

    listContent: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 24 },

    // Card
    card: {
      marginBottom: 14,
      borderRadius: 16,
      backgroundColor: theme.colors.white,
      overflow: 'hidden',
      boxShadow: `0px 2px 8px rgba(0, 0, 0, 0.07)`,
      elevation: 3,
    },

    // Photo
    photoWrapper: { position: 'relative' },
    image: { width: '100%', height: 230 },
    photoScrim: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 110,
      backgroundColor: theme.colors.overlayDark,
    },
    badgeRow: {
      position: 'absolute',
      top: 10,
      left: 10,
      flexDirection: 'row',
      gap: 6,
    },
    onlineBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: theme.colors.overlayDark,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 20,
    },
    onlineDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: theme.colors.success,
    },
    onlineBadgeText: {
      color: theme.colors.white,
      fontSize: 11,
      fontWeight: '700',
    },
    newBadge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 20,
    },
    newBadgeText: {
      color: theme.colors.white,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    nameOverlay: {
      position: 'absolute',
      bottom: 10,
      left: 12,
      right: 12,
    },
    nameOverlayText: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.colors.white,
    },
    cityOverlayText: {
      fontSize: 12,
      color: theme.colors.white,
      marginTop: 2,
    },

    // Info
    info: { padding: 12 },
    tagsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 12,
    },
    tag: {
      backgroundColor: theme.colors.primaryLight,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    tagText: { fontSize: 11, color: theme.colors.primary, fontWeight: '600' },

    // Actions
    actions: { flexDirection: 'row', gap: 10 },
    chatBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      boxShadow: `0px 3px 6px rgba(0, 0, 0, 0.3)`,
      elevation: 4,
    },
    chatText: { color: theme.colors.white, fontWeight: '700', fontSize: 13 },
    profileBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
      alignItems: 'center',
    },
    profileText: {
      color: theme.colors.primary,
      fontWeight: '700',
      fontSize: 13,
    },

    // States
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
    loadingText: { fontSize: 13, color: theme.colors.textMuted, marginTop: 8 },
    emptyEmoji: { fontSize: 40, marginBottom: 4 },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    emptySub: { fontSize: 13, color: theme.colors.textMuted },
  });
