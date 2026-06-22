import { createBaseStyles } from '@/core/theme/baseStyles';
import { Theme } from '@/core/theme/types';
import { Platform, StyleSheet } from 'react-native';

export const chatStyles = (
  theme: Theme,
  base: ReturnType<typeof createBaseStyles>
) =>
  StyleSheet.create({
    container: StyleSheet.flatten(base.container),
    flex: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundPage,
    },
    chatSurface: {
      flex: 1,
      width: '100%',
      maxWidth: Platform.OS === 'web' ? 860 : undefined,
      backgroundColor: theme.colors.backgroundPage,
      alignSelf: 'center',
    },

    // ─── Header ───────────────────────────────────────────────────────────
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: theme.colors.surface,
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
      borderColor: theme.colors.surface,
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
      flexGrow: 1,
      paddingHorizontal: Platform.OS === 'web' ? 18 : 12,
      paddingTop: 14,
      paddingBottom: 18,
    },
    messageRow: {
      marginVertical: 3,
    },
    leftAlign: { alignItems: 'flex-start' },
    rightAlign: { alignItems: 'flex-end' },

    bubble: {
      maxWidth: Platform.OS === 'web' ? '68%' : '82%',
      borderRadius: 16,
      paddingHorizontal: 13,
      paddingVertical: 9,
      elevation: 1,
      shadowColor: theme.colors.black,
      shadowOpacity: 0.05,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
    },
    myBubble: {
      backgroundColor: theme.colors.primary,
      borderBottomRightRadius: 4,
    },
    otherBubble: {
      backgroundColor: theme.colors.surface,
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
    audioBubble: {
      minWidth: 190,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    audioPlayBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
    },
    audioPlayBtnMe: {
      backgroundColor: theme.colors.white,
    },
    audioWave: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      flex: 1,
      minHeight: 28,
    },
    audioWaveBar: {
      width: 3,
      borderRadius: 3,
      backgroundColor: theme.colors.primary,
      opacity: 0.75,
    },
    audioWaveBarMe: {
      backgroundColor: theme.colors.white,
    },
    audioLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    audioLabelMe: {
      color: theme.colors.white,
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
      color: theme.colors.accentLight,
    },
    tickWrap: {
      width: 21,
      height: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginLeft: 1,
    },
    secondTick: {
      marginLeft: -8,
    },
    reactionSummary: {
      flexDirection: 'row',
      alignSelf: 'flex-start',
      gap: 2,
      marginTop: 5,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
      backgroundColor: theme.colors.backgroundLight,
    },
    reactionSummaryText: {
      fontSize: 12,
      lineHeight: 16,
    },
    reactionBar: {
      flexDirection: 'row',
      gap: 4,
      marginTop: 2,
      marginLeft: 6,
    },
    reactionBarMe: {
      marginLeft: 0,
      marginRight: 6,
    },
    reactionButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
    },
    reactionButtonText: {
      fontSize: 15,
      lineHeight: 19,
    },

    // ─── Emoji Picker ─────────────────────────────────────────────────────
    emojiBox: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 8,
      paddingVertical: 8,
      backgroundColor: theme.colors.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      maxHeight: 180,
    },
    emojiBtn: {
      padding: 6,
      borderRadius: 8,
    },
    emoji: { fontSize: 26 },

    recordingBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: theme.colors.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
    },
    recordingPulse: {
      width: 9,
      height: 9,
      borderRadius: 5,
      backgroundColor: theme.colors.error,
    },
    recordingText: {
      flex: 1,
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    recordingCancelBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.backgroundLight,
    },

    // ─── Input Bar ────────────────────────────────────────────────────────
    inputBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Platform.OS === 'web' ? 16 : 10,
      paddingTop: 8,
      paddingBottom: 8,
      backgroundColor: theme.colors.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.divider,
      gap: 8,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.backgroundLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconBtnLocked: {
      opacity: 0.42,
      backgroundColor: theme.colors.backgroundLight,
    },
    recordingIconBtn: {
      backgroundColor: theme.colors.error,
    },
    input: {
      flex: 1,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingTop: 0,
      paddingBottom: 0,
      backgroundColor: theme.colors.backgroundLight,
      fontSize: 14,
      color: theme.colors.textPrimary,
      height: 40,
      maxHeight: 112,
      lineHeight: 20,
      textAlignVertical: 'center',
    },
    sendBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.backgroundLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendBtnActive: {
      backgroundColor: theme.colors.primary,
      elevation: 4,
    },
  });
