import { Theme } from '@/core/theme/types';
import { StyleSheet } from 'react-native';

export const chatStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPage,
    },
    flex: { flex: 1 },

    // ─── Header ───────────────────────────────────────────────────────────
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: theme.colors.white,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      elevation: 3,
      gap: 10,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.backgroundLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarWrapper: { position: 'relative' },
    headerAvatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      borderWidth: 2,
      borderColor: theme.colors.primaryLight,
    },
    onlineDot: {
      position: 'absolute',
      right: 1,
      bottom: 1,
      width: 11,
      height: 11,
      borderRadius: 6,
      backgroundColor: theme.colors.success,
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
      marginTop: 1,
    },
    onlineDotInline: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.success,
    },
    headerSub: {
      fontSize: 11,
      color: theme.colors.success,
      fontWeight: '500',
    },
    headerActions: {
      flexDirection: 'row',
      gap: 8,
    },
    headerActionBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.backgroundLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    viewProfileBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight,
    },
    viewProfileText: {
      color: theme.colors.primary,
      fontWeight: '700',
      fontSize: 12,
    },

    // ─── Date Separator ───────────────────────────────────────────────────
    dateSeparator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 12,
      paddingHorizontal: 16,
      gap: 10,
    },
    dateLine: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.divider,
    },
    dateText: {
      fontSize: 11,
      color: theme.colors.textMuted,
      fontWeight: '600',
      paddingHorizontal: 8,
      paddingVertical: 3,
      backgroundColor: theme.colors.backgroundLight,
      borderRadius: 10,
    },

    // ─── Messages ─────────────────────────────────────────────────────────
    messagesList: {
      paddingHorizontal: 12,
      paddingVertical: 14,
    },
    messageRow: {
      marginVertical: 3,
    },
    leftAlign: { alignItems: 'flex-start' },
    rightAlign: { alignItems: 'flex-end' },

    bubble: {
      maxWidth: '78%',
      borderRadius: 18,
      paddingHorizontal: 13,
      paddingVertical: 9,
      elevation: 1,
    },
    myBubble: {
      backgroundColor: theme.colors.primary,
      borderBottomRightRadius: 4,
    },
    otherBubble: {
      backgroundColor: theme.colors.white,
      borderBottomLeftRadius: 4,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
    },
    messageText: {
      fontSize: 14,
      color: theme.colors.textPrimary,
      lineHeight: 21,
    },
    myText: {
      color: theme.colors.white,
    },
    image: {
      width: 200,
      height: 200,
      borderRadius: 12,
    },
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 3,
      marginTop: 4,
    },
    time: {
      fontSize: 10,
      color: theme.colors.textMuted,
    },
    timeMe: {
      color: 'rgba(255,255,255,0.65)',
    },
    readTick: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.85)',
      fontWeight: '700',
    },

    // ─── Emoji Picker ─────────────────────────────────────────────────────
    emojiBox: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 8,
      paddingVertical: 8,
      backgroundColor: theme.colors.white,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      maxHeight: 180,
    },
    emojiBtn: {
      padding: 6,
      borderRadius: 8,
    },
    emoji: { fontSize: 26 },

    // ─── Input Bar ────────────────────────────────────────────────────────
    inputBar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 10,
      paddingVertical: 8,
      paddingBottom: 12,
      backgroundColor: theme.colors.white,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      gap: 8,
    },
    iconBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.backgroundLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 2,
    },
    input: {
      flex: 1,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      borderRadius: 22,
      paddingHorizontal: 14,
      paddingVertical: 9,
      backgroundColor: theme.colors.backgroundLight,
      fontSize: 14,
      color: theme.colors.textPrimary,
      maxHeight: 100,
      lineHeight: 20,
    },
    sendBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.backgroundLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 1,
    },
    sendBtnActive: {
      backgroundColor: theme.colors.primary,
      elevation: 4,
    },
  });
