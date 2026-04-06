import { Theme } from '@/core/theme/types';
import { StyleSheet } from 'react-native';

export const chatStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },
    flex: {
      flex: 1,
    },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: theme.colors.backgroundPage,
      borderBottomWidth: 1,
      borderColor: theme.colors.border,
      boxShadow: `0px 1px 4px rgba(0, 0, 0, 0.04)`,
      elevation: 2,
      gap: 10,
    },
    backBtn: { paddingHorizontal: 4 },
    backArrow: {
      fontSize: 30,
      color: theme.colors.textPrimary,
      lineHeight: 32,
    },

    avatarWrapper: { position: 'relative' },
    headerAvatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    onlineDot: {
      position: 'absolute',
      right: 1,
      bottom: 1,
      width: 11,
      height: 11,
      borderRadius: 6,
      backgroundColor: theme.colors.primaryLight,
      borderWidth: 2,
      borderColor: theme.colors.white,
    },

    headerInfo: { flex: 1 },
    headerName: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    onlineRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 2,
    },
    onlineDotInline: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: theme.colors.primaryLight,
    },
    headerSub: {
      fontSize: 11,
      color: theme.colors.primaryLight,
      fontWeight: '600',
    },

    viewProfileBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
    },
    viewProfileText: {
      color: theme.colors.primary,
      fontWeight: '700',
      fontSize: 12,
    },

    // Messages
    messagesList: { paddingHorizontal: 12, paddingVertical: 14 },

    messageRow: { marginVertical: 3 },
    leftAlign: { alignItems: 'flex-start' },
    rightAlign: { alignItems: 'flex-end' },

    bubble: {
      maxWidth: '78%',
      borderRadius: 16,
      padding: 10,
      boxShadow: `0px 1px 2px rgba(0, 0, 0, 0.05)`,
      elevation: 1,
    },
    myBubble: {
      backgroundColor: theme.colors.primary,
      borderBottomRightRadius: 4,
    },
    otherBubble: {
      backgroundColor: theme.colors.backgroundPage,
      borderBottomLeftRadius: 4,
    },
    messageText: {
      fontSize: 14,
      color: theme.colors.textPrimary,
      lineHeight: 20,
    },
    myText: { color: theme.colors.textPrimary },
    image: { width: 200, height: 200, borderRadius: 10 },
    time: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      alignSelf: 'flex-end',
      marginTop: 4,
    },
    timeMe: { color: theme.colors.textSecondary },
    readTick: { fontSize: 10, color: theme.colors.primary, fontWeight: '700' },

    // Emoji picker
    emojiBox: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 8,
      paddingVertical: 6,
      backgroundColor: theme.colors.white,
      borderTopWidth: 1,
      borderColor: theme.colors.border,
    },
    emojiBtn: { padding: 6 },
    emoji: { fontSize: 26 },

    // Input bar
    inputBar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 10,
      paddingVertical: 8,
      paddingBottom: 10,
      backgroundColor: theme.colors.white,
      borderTopWidth: 1,
      borderColor: theme.colors.border,
      gap: 6,
    },
    iconBtn: { paddingBottom: 9 },
    iconText: { fontSize: 22 },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 22,
      paddingHorizontal: 14,
      paddingVertical: 9,
      backgroundColor: theme.colors.backgroundPage,
      fontSize: 14,
      color: theme.colors.textPrimary,
      maxHeight: 100,
      lineHeight: 20,
    },
    sendBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 1,
    },
    sendBtnActive: {
      backgroundColor: theme.colors.primary,
      boxShadow: `0px 3px 6px rgba(0, 0, 0, 0.3)`,
      elevation: 4,
    },
    sendText: { fontSize: 16, color: theme.colors.white },
    sendTextActive: { color: theme.colors.white },
  });
