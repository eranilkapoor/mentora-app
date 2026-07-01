import {
  buildReadReceiptPayload,
  buildSendMessagePayload,
  getLatestUnreadMessageId,
} from './chatWorkflow.utils';
import type { ChatMessage } from '@/store/services/chatApi.service';

describe('chat workflow utils', () => {
  const messages: ChatMessage[] = [
    {
      id: 'm1',
      roomId: 'r1',
      senderId: 'u2',
      receiverId: 'u1',
      attachments: [],
    },
    {
      id: 'm2',
      roomId: 'r1',
      senderId: 'u2',
      receiverId: 'u1',
      attachments: [],
      readAt: '2026-07-01T08:00:00.000Z',
    },
    {
      id: 'm3',
      roomId: 'r1',
      senderId: 'u3',
      receiverId: 'u1',
      attachments: [],
    },
  ];

  it('builds send payload only when content and room are valid', () => {
    expect(
      buildSendMessagePayload('room-1', '  hello  ', false, () => 'cid-1')
    ).toEqual({
      roomId: 'room-1',
      content: 'hello',
      clientMessageId: 'cid-1',
    });

    expect(buildSendMessagePayload('room-1', '   ', false)).toBeNull();
    expect(buildSendMessagePayload(undefined, 'hello', false)).toBeNull();
    expect(buildSendMessagePayload('room-1', 'hello', true)).toBeNull();
  });

  it('finds latest unread message from other users', () => {
    expect(getLatestUnreadMessageId(messages, 'u1')).toBe('m3');
    expect(getLatestUnreadMessageId(messages, 'u2')).toBe('m3');
    expect(
      getLatestUnreadMessageId(
        messages.map((message) => ({
          ...message,
          readAt: message.readAt ?? '2026-07-01T09:00:00.000Z',
        })),
        'u1'
      )
    ).toBeNull();
  });

  it('builds read receipt payload and deduplicates repeated keys', () => {
    expect(buildReadReceiptPayload('room-1', 'm3', null)).toEqual({
      requestKey: 'room-1:m3',
      payload: {
        roomId: 'room-1',
        upToMessageId: 'm3',
      },
    });

    expect(buildReadReceiptPayload('room-1', 'm3', 'room-1:m3')).toBeNull();
    expect(buildReadReceiptPayload(undefined, 'm3', null)).toBeNull();
    expect(buildReadReceiptPayload('room-1', null, null)).toBeNull();
  });
});
