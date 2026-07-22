import { ChatMessage } from '@/store/services/chatApi.service';

export const buildSendMessagePayload = (
  activeRoomId: string | undefined,
  inputText: string,
  isSending: boolean,
  createClientMessageId: () => string = () => `${Date.now()}`
): {
  roomId: string;
  content: string;
  clientMessageId: string;
} | null => {
  const content = inputText.trim();
  if (!content || !activeRoomId || isSending) {
    return null;
  }

  return {
    roomId: activeRoomId,
    content,
    clientMessageId: createClientMessageId(),
  };
};

export const getLatestUnreadMessageId = (
  messages: ChatMessage[],
  currentUserId: string
): string | null => {
  const incomingUnreadMessages = messages.filter(
    (message) => message.senderId !== currentUserId && !message.readAt
  );
  const latestUnreadMessage =
    incomingUnreadMessages[incomingUnreadMessages.length - 1];

  return latestUnreadMessage?.id ?? null;
};

export const buildReadReceiptPayload = (
  activeRoomId: string | undefined,
  latestUnreadMessageId: string | null,
  lastRequestKey: string | null
): {
  requestKey: string;
  payload: {
    roomId: string;
    upToMessageId: string;
  };
} | null => {
  if (!activeRoomId || !latestUnreadMessageId) {
    return null;
  }

  const requestKey = `${activeRoomId}:${latestUnreadMessageId}`;
  if (requestKey === lastRequestKey) {
    return null;
  }

  return {
    requestKey,
    payload: {
      roomId: activeRoomId,
      upToMessageId: latestUnreadMessageId,
    },
  };
};
