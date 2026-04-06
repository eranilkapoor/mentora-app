import { Theme } from '@/core/theme/types';
import { StyleSheet } from 'react-native';

export const chatsListStyles = (theme: Theme) =>
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
      paddingTop: 12,
      paddingBottom: 10,
      backgroundColor: theme.colors.white,
      borderBottomWidth: 1,
      borderColor: theme.colors.divider,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    headerSub: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    filterBtn: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.white,
    },
    filterText: {
      fontSize: 13,
      color: theme.colors.textBody,
      fontWeight: '600',
    },

    // Search
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      margin: 12,
      paddingHorizontal: 12,
      backgroundColor: theme.colors.white,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.divider,
    },
    searchIcon: {
      fontSize: 15,
      marginRight: 6,
    },
    searchInput: {
      flex: 1,
      height: 44,
      fontSize: 14,
      color: theme.colors.textPrimary,
    },

    listContent: {
      paddingBottom: 24,
    },

    // Card
    card: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: theme.colors.white,
      borderBottomWidth: 1,
      borderColor: theme.colors.divider,
    },
    cardUnread: {
      backgroundColor: theme.colors.primaryLight, // 🔥 instead of RED_LIGHT
    },

    // Avatar
    avatarWrap: {
      marginRight: 12,
      position: 'relative',
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 2,
      borderColor: theme.colors.divider,
    },
    onlineDot: {
      position: 'absolute',
      right: 1,
      bottom: 1,
      width: 13,
      height: 13,
      borderRadius: 7,
      backgroundColor: theme.colors.success, // 🔥 instead of hardcoded green
      borderWidth: 2,
      borderColor: theme.colors.white,
    },

    // Info
    info: {
      flex: 1,
      justifyContent: 'center',
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 2,
    },
    name: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    nameUnread: {
      fontWeight: '800',
    },
    time: {
      fontSize: 11,
      color: theme.colors.textMuted,
    },
    city: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    lastMessage: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      flex: 1,
      marginRight: 8,
    },
    lastMessageUnread: {
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },

    // Badge
    badge: {
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      paddingHorizontal: 5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      color: theme.colors.white,
      fontSize: 11,
      fontWeight: '800',
    },

    // States
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 8,
    },
    emptyEmoji: {
      fontSize: 40,
      marginBottom: 4,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    emptySub: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
  });
