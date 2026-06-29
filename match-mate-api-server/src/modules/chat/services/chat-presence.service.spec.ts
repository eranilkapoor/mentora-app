import { ChatPresenceService } from './chat-presence.service';

describe('ChatPresenceService', () => {
  let service: ChatPresenceService;

  beforeEach(() => {
    service = new ChatPresenceService();
  });

  it('tracks multiple sockets until the final disconnect', () => {
    service.connect('user-1', 'socket-1');
    service.connect('user-1', 'socket-2');

    expect(service.getUserIdBySocket('socket-1')).toBe('user-1');
    expect(service.isOnline('user-1')).toBe(true);
    expect(service.getConnectedCount('user-1')).toBe(2);
    expect(service.getLastSeen('user-1')).toBeNull();

    expect(service.disconnect('socket-1')).toBe('user-1');
    expect(service.isOnline('user-1')).toBe(true);
    expect(service.getConnectedCount('user-1')).toBe(1);
    expect(service.getLastSeen('user-1')).toBeNull();

    expect(service.disconnect('socket-2')).toBe('user-1');
    expect(service.isOnline('user-1')).toBe(false);
    expect(service.getConnectedCount('user-1')).toBe(0);
    expect(service.getLastSeen('user-1')).toBeInstanceOf(Date);
  });

  it('ignores unknown socket disconnections', () => {
    expect(service.disconnect('missing')).toBeUndefined();
    expect(service.getUserIdBySocket('missing')).toBeUndefined();
  });

  it('tolerates a missing socket set for a known socket mapping', () => {
    service.connect('user-1', 'socket-1');
    const userSockets = (
      service as unknown as { userSockets: Map<string, Set<string>> }
    ).userSockets;
    userSockets.delete('user-1');

    expect(service.disconnect('socket-1')).toBe('user-1');
  });
});
