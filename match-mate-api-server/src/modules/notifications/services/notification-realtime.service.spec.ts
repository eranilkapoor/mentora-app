import { NotificationRealtimeService } from './notification-realtime.service';

describe('NotificationRealtimeService', () => {
  const logger = { warn: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('builds stable notification user room names', () => {
    const service = new NotificationRealtimeService(logger as never);

    expect(service.getUserRoom('user-1')).toBe('notification:user:user-1');
  });

  it('warns when emitting before the server is bound', () => {
    const service = new NotificationRealtimeService(logger as never);

    service.emitToUser('user-1', 'notification:new', {});

    expect(logger.warn).toHaveBeenCalledWith(
      'Notification realtime server not ready',
      {
        event: 'notification:new',
        userId: 'user-1',
      },
    );
  });

  it('emits to the user room after binding a server', () => {
    const roomEmitter = { emit: jest.fn() };
    const server = { to: jest.fn(() => roomEmitter) };
    const service = new NotificationRealtimeService(logger as never);

    service.bindServer(server as never);
    service.emitToUser('user-1', 'notification:new', { id: 'n1' });

    expect(server.to).toHaveBeenCalledWith('notification:user:user-1');
    expect(roomEmitter.emit).toHaveBeenCalledWith('notification:new', {
      id: 'n1',
    });
  });
});
