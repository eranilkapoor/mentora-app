import { AppDispatch } from '@/store';
import { DeviceEventEmitter } from 'react-native';
import { getApiOrigin } from '@/core/utils/config';
import {
  chatApi,
  ChatConversation,
  ChatMessage,
} from '@/store/services/chatApi.service';
import {
  AppNotification,
  notificationApi,
} from '@/store/services/notificationApi.service';
import { io, Socket } from 'socket.io-client';
import { showInfo } from '@/core/utils/toast';
import { authApi } from '@/store/services/authApi.service';
import { isRealtimeAuthError } from './realtime-auth.utils';

type RealtimeNamespace = 'chats' | 'notifications';

interface UnreadCountPayload {
  unreadCount: number;
}

interface MessageDeliveredPayload {
  roomId: string;
  userId: string;
  deliveredAt?: string;
}

interface MessageReadPayload {
  roomId: string;
  userId: string;
  upToMessageId?: string | null;
  readAt?: string;
}

interface MessageDeletedPayload {
  roomId: string;
  messageId: string;
  deletedAt?: string;
}

export interface UserBlockedPayload {
  blockerId: string;
  blockedUserId: string;
  blockedAt?: string;
}

export const REALTIME_USER_BLOCKED_EVENT = 'realtime:user-blocked';
export const REALTIME_TYPING_EVENT = 'realtime:typing';

export interface RealtimeTypingPayload {
  roomId: string;
  userId: string;
  isTyping: boolean;
}

let chatSocket: Socket | null = null;
let notificationSocket: Socket | null = null;
let activeToken: string | null = null;
let authRecoveryInFlight: Promise<unknown> | null = null;

const buildNamespaceUrl = (namespace: RealtimeNamespace): string =>
  `${getApiOrigin()}/${namespace}`;

const createSocket = (namespace: RealtimeNamespace, token: string): Socket =>
  io(buildNamespaceUrl(namespace), {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 700,
    reconnectionDelayMax: 5000,
    timeout: 12000,
  });

const recoverRealtimeAuthentication = (dispatch: AppDispatch): void => {
  if (authRecoveryInFlight) return;

  chatSocket?.disconnect();
  notificationSocket?.disconnect();

  const request = dispatch(
    authApi.endpoints.verifyUser.initiate(undefined, {
      forceRefetch: true,
      subscribe: false,
    })
  );
  authRecoveryInFlight = request
    .unwrap()
    .catch(() => {
      disconnectRealtime();
    })
    .finally(() => {
      request.unsubscribe();
      authRecoveryInFlight = null;
    });
};

const attachAuthenticationRecovery = (
  socket: Socket,
  dispatch: AppDispatch
): void => {
  socket.on('connect_error', (error: Error) => {
    if (isRealtimeAuthError(error)) {
      recoverRealtimeAuthentication(dispatch);
    }
  });
};

const appendMessageToRoomCache = (
  dispatch: AppDispatch,
  message: ChatMessage
): void => {
  const queryArgs = [
    { roomId: message.roomId, limit: 50 },
    { roomId: message.roomId, limit: 30 },
  ];

  queryArgs.forEach((queryArg) => {
    dispatch(
      chatApi.util.updateQueryData('getMessages', queryArg, (draft) => {
        if (!draft.success || !draft.data?.items) return;

        const exists = draft.data.items.some((item) => item.id === message.id);
        if (!exists) {
          draft.data.items.push(message);
        }
      })
    );
  });
};

const updateRoomMessageReceipts = (
  dispatch: AppDispatch,
  payload: MessageDeliveredPayload | MessageReadPayload,
  nextStatus: 'DELIVERED' | 'READ'
): void => {
  const queryArgs = [
    { roomId: payload.roomId, limit: 50 },
    { roomId: payload.roomId, limit: 30 },
  ];

  queryArgs.forEach((queryArg) => {
    dispatch(
      chatApi.util.updateQueryData('getMessages', queryArg, (draft) => {
        if (!draft.success || !draft.data?.items) return;

        draft.data.items.forEach((message) => {
          if (message.receiverId !== payload.userId) return;

          if (nextStatus === 'DELIVERED' && !message.readAt) {
            message.status = 'DELIVERED';
            message.deliveredAt =
              (payload as MessageDeliveredPayload).deliveredAt ??
              new Date().toISOString();
            return;
          }

          if (nextStatus === 'READ') {
            message.status = 'READ';
            message.readAt =
              (payload as MessageReadPayload).readAt ??
              new Date().toISOString();
            message.deliveredAt = message.deliveredAt ?? message.readAt;
          }
        });
      })
    );
  });
};

const removeDeletedMessageFromCache = (
  dispatch: AppDispatch,
  payload: MessageDeletedPayload
): void => {
  const queryArgs = [
    { roomId: payload.roomId, limit: 50 },
    { roomId: payload.roomId, limit: 30 },
  ];

  queryArgs.forEach((queryArg) => {
    dispatch(
      chatApi.util.updateQueryData('getMessages', queryArg, (draft) => {
        if (!draft.success || !draft.data?.items) return;

        draft.data.items = draft.data.items.filter(
          (message) => message.id !== payload.messageId
        );
      })
    );
  });
};

const prependNotificationToCache = (
  dispatch: AppDispatch,
  notification: AppNotification
): void => {
  dispatch(
    notificationApi.util.updateQueryData(
      'getNotifications',
      undefined,
      (draft) => {
        if (!draft.success || !draft.data?.items) return;

        const exists = draft.data.items.some(
          (item) => item._id === notification._id
        );
        if (!exists) {
          draft.data.items.unshift(notification);
          draft.data.total += 1;
        }
      }
    )
  );
};

const updateUnreadNotificationCount = (
  dispatch: AppDispatch,
  payload: UnreadCountPayload
): void => {
  dispatch(
    notificationApi.util.updateQueryData(
      'getUnreadNotificationCount',
      undefined,
      (draft) => {
        if (!draft.success || !draft.data) return;
        draft.data.unreadCount = payload.unreadCount;
      }
    )
  );
};

const shouldShowRealtimeToast = (notification: AppNotification): boolean => {
  const source = notification.metadata?.source;

  if (
    notification.category === 'system' &&
    typeof source === 'string' &&
    source.startsWith('profile-')
  ) {
    return false;
  }

  return true;
};

export const connectRealtime = (token: string, dispatch: AppDispatch): void => {
  if (activeToken === token && chatSocket?.connected) {
    return;
  }

  disconnectRealtime();
  activeToken = token;

  chatSocket = createSocket('chats', token);
  notificationSocket = createSocket('notifications', token);
  attachAuthenticationRecovery(chatSocket, dispatch);
  attachAuthenticationRecovery(notificationSocket, dispatch);

  chatSocket.on('message:new', (message: ChatMessage) => {
    appendMessageToRoomCache(dispatch, message);
    dispatch(chatApi.util.invalidateTags(['Chat']));
  });

  chatSocket.on('conversation:updated', (_conversation: ChatConversation) => {
    dispatch(chatApi.util.invalidateTags(['Chat']));
  });

  chatSocket.on('message:delivered', (payload: MessageDeliveredPayload) => {
    updateRoomMessageReceipts(dispatch, payload, 'DELIVERED');
    dispatch(chatApi.util.invalidateTags(['Chat']));
  });

  chatSocket.on('message:read', (payload: MessageReadPayload) => {
    updateRoomMessageReceipts(dispatch, payload, 'READ');
    dispatch(chatApi.util.invalidateTags(['Chat']));
  });

  chatSocket.on('message:deleted', (payload: MessageDeletedPayload) => {
    removeDeletedMessageFromCache(dispatch, payload);
    dispatch(chatApi.util.invalidateTags(['Chat']));
  });

  chatSocket.on('typing', (payload: RealtimeTypingPayload) => {
    DeviceEventEmitter.emit(REALTIME_TYPING_EVENT, payload);
  });

  chatSocket.on('user:blocked', (payload: UserBlockedPayload) => {
    DeviceEventEmitter.emit(REALTIME_USER_BLOCKED_EVENT, payload);
    dispatch(chatApi.util.invalidateTags(['Chat']));
  });

  notificationSocket.on('notification:new', (notification: AppNotification) => {
    prependNotificationToCache(dispatch, notification);
    if (shouldShowRealtimeToast(notification)) {
      showInfo({
        title: notification.title,
        message: notification.message,
      });
    }
    dispatch(notificationApi.util.invalidateTags(['Notification']));
  });

  notificationSocket.on(
    'notification:unread-count',
    (payload: UnreadCountPayload) => {
      updateUnreadNotificationCount(dispatch, payload);
    }
  );

  notificationSocket.on('notification:read', () => {
    dispatch(notificationApi.util.invalidateTags(['Notification']));
  });

  notificationSocket.on('notification:all-read', () => {
    dispatch(notificationApi.util.invalidateTags(['Notification']));
  });
};

export const disconnectRealtime = (): void => {
  chatSocket?.removeAllListeners();
  notificationSocket?.removeAllListeners();
  chatSocket?.disconnect();
  notificationSocket?.disconnect();
  chatSocket = null;
  notificationSocket = null;
  activeToken = null;
};

export const joinChatRoom = (roomId: string): void => {
  chatSocket?.emit('room:join', { roomId });
};

export const leaveChatRoom = (roomId: string): void => {
  chatSocket?.emit('room:leave', { roomId });
};

export const emitTyping = (roomId: string, isTyping: boolean): void => {
  chatSocket?.emit('typing', { roomId, isTyping });
};
