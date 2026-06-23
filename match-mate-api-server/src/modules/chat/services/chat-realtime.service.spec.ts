import { ChatRealtimeService } from './chat-realtime.service';

describe('ChatRealtimeService', () => {
  const logger = { warn: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds stable user and conversation room names', () => {
    const service = new ChatRealtimeService(logger as never);

    expect(service.getUserRoom('user-1')).toBe('chat:user:user-1');
    expect(service.getConversationRoom('room-1')).toBe(
      'chat:conversation:room-1',
    );
  });

  it('warns instead of throwing when server is not ready', () => {
    const service = new ChatRealtimeService(logger as never);

    service.emitToUser('user-1', 'event', {});
    service.emitToConversation('room-1', 'event', {});

    expect(logger.warn).toHaveBeenCalledTimes(2);
  });

  it('emits to user and conversation rooms after binding a server', () => {
    const roomEmitter = { emit: jest.fn() };
    const server = { to: jest.fn(() => roomEmitter) };
    const service = new ChatRealtimeService(logger as never);

    service.bindServer(server as never);
    service.emitToUser('user-1', 'event:user', { ok: true });
    service.emitToConversation('room-1', 'event:room', { ok: true });

    expect(server.to).toHaveBeenCalledWith('chat:user:user-1');
    expect(server.to).toHaveBeenCalledWith('chat:conversation:room-1');
    expect(roomEmitter.emit).toHaveBeenCalledWith('event:user', { ok: true });
    expect(roomEmitter.emit).toHaveBeenCalledWith('event:room', { ok: true });
  });
});
