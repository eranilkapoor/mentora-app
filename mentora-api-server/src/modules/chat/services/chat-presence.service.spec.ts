import { ChatPresenceService } from './chat-presence.service';

describe('ChatPresenceService', () => {
  let service: ChatPresenceService;
  let store: Map<string, unknown>;
  let cache: {
    set: jest.Mock;
    get: jest.Mock;
    del: jest.Mock;
    has: jest.Mock;
  };

  beforeEach(() => {
    store = new Map<string, unknown>();
    cache = {
      set: jest.fn((key: string, value: unknown) => {
        store.set(key, value);
        return Promise.resolve();
      }),
      get: jest.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
      del: jest.fn((key: string) => {
        store.delete(key);
        return Promise.resolve();
      }),
      has: jest.fn((key: string) => Promise.resolve(store.has(key))),
    };
    service = new ChatPresenceService(cache as never);
  });

  it('tracks multiple sockets until the final disconnect', async () => {
    await service.connect('user-1', 'socket-1');
    await service.connect('user-1', 'socket-2');

    await expect(service.getUserIdBySocket('socket-1')).resolves.toBe('user-1');
    await expect(service.isOnline('user-1')).resolves.toBe(true);
    await expect(service.getConnectedCount('user-1')).resolves.toBe(2);
    await expect(service.getLastSeen('user-1')).resolves.toBeNull();

    await expect(service.disconnect('socket-1')).resolves.toBe('user-1');
    await expect(service.isOnline('user-1')).resolves.toBe(true);
    await expect(service.getConnectedCount('user-1')).resolves.toBe(1);
    await expect(service.getLastSeen('user-1')).resolves.toBeNull();

    await expect(service.disconnect('socket-2')).resolves.toBe('user-1');
    await expect(service.isOnline('user-1')).resolves.toBe(false);
    await expect(service.getConnectedCount('user-1')).resolves.toBe(0);
    await expect(service.getLastSeen('user-1')).resolves.toBeInstanceOf(Date);
  });

  it('ignores unknown socket disconnections', async () => {
    await expect(service.disconnect('missing')).resolves.toBeUndefined();
    await expect(service.getUserIdBySocket('missing')).resolves.toBeUndefined();
  });

  it('tolerates a missing socket set for a known socket mapping', async () => {
    await service.connect('user-1', 'socket-1');
    const userSockets = (
      service as unknown as { userSockets: Map<string, Set<string>> }
    ).userSockets;
    userSockets.delete('user-1');

    await expect(service.disconnect('socket-1')).resolves.toBe('user-1');
  });

  it('tracks typing state in cache with a short TTL', async () => {
    await service.setTyping('room-1', 'user-1', true);

    expect(cache.set).toHaveBeenCalledWith(
      'typing:room:room-1:user:user-1',
      true,
      10,
    );
    await expect(service.isTyping('room-1', 'user-1')).resolves.toBe(true);

    await service.setTyping('room-1', 'user-1', false);

    expect(cache.del).toHaveBeenCalledWith('typing:room:room-1:user:user-1');
    await expect(service.isTyping('room-1', 'user-1')).resolves.toBe(false);
  });
});
