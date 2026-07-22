const mockWorkers: Array<{
  processor: (job: unknown) => Promise<unknown>;
  options: Record<string, unknown>;
  handlers: Record<string, (...args: unknown[]) => void>;
  close: jest.Mock;
}> = [];

jest.mock('bullmq', () => ({
  Worker: jest
    .fn()
    .mockImplementation(
      (
        _name: string,
        processor: (job: unknown) => Promise<unknown>,
        options: Record<string, unknown>,
      ) => {
        const handlers: Record<string, (...args: unknown[]) => void> = {};
        const worker = {
          processor,
          options,
          handlers,
          on: jest.fn(
            (event: string, handler: (...args: unknown[]) => void) => {
              handlers[event] = handler;
            },
          ),
          close: jest.fn().mockResolvedValue(undefined),
        };
        mockWorkers.push(worker);
        return worker;
      },
    ),
}));

import { NotificationDispatchWorker } from './notification-dispatch.worker';

describe('NotificationDispatchWorker', () => {
  const queueService = {
    isEnabled: jest.fn(),
    getQueueName: jest.fn(),
    getConcurrency: jest.fn(),
    enqueueDeadLetter: jest.fn(),
    getDlqName: jest.fn(),
  };
  const notificationsService = { processDispatchJob: jest.fn() };
  const configService = { get: jest.fn() };
  const logger = { log: jest.fn(), warn: jest.fn(), error: jest.fn() };

  let worker: NotificationDispatchWorker;
  const data = {
    notificationId: 'n1',
    userId: 'u1',
    title: 'Title',
    message: 'Body',
    subject: 'Subject',
    decision: { inApp: true, push: false, email: false, sms: false },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockWorkers.length = 0;
    queueService.isEnabled.mockReturnValue(true);
    queueService.getQueueName.mockReturnValue('dispatch');
    queueService.getConcurrency.mockReturnValue(4);
    queueService.getDlqName.mockReturnValue('dlq');
    queueService.enqueueDeadLetter.mockResolvedValue(undefined);
    notificationsService.processDispatchJob.mockResolvedValue(undefined);
    configService.get.mockImplementation(
      (_key: string, fallback?: unknown) => fallback,
    );
    worker = new NotificationDispatchWorker(
      queueService as never,
      notificationsService as never,
      configService as never,
      logger as never,
    );
  });

  it('does not start when queues are disabled and safely destroys', async () => {
    queueService.isEnabled.mockReturnValue(false);
    worker.onModuleInit();
    expect(mockWorkers).toHaveLength(0);
    expect(logger.log).toHaveBeenCalledWith(
      'Notification worker disabled (queue disabled)',
    );
    await expect(worker.onModuleDestroy()).resolves.toBeUndefined();
  });

  it('starts with configured Redis, handles events, processes jobs, and closes', async () => {
    configService.get.mockImplementation((key: string, fallback?: unknown) => {
      const values: Record<string, unknown> = {
        'redis.host': 'redis',
        'redis.port': 6380,
        'redis.password': 'secret',
        'redis.db': '2',
      };
      return values[key] ?? fallback;
    });
    worker.onModuleInit();
    expect(mockWorkers).toHaveLength(1);
    const instance = mockWorkers[0];
    expect(instance.options).toMatchObject({
      concurrency: 4,
      connection: { host: 'redis', port: 6380, password: 'secret', db: 2 },
    });
    instance.handlers.completed({ id: 'job-1', data });
    instance.handlers.failed(
      { id: 'job-1', data, attemptsMade: 1 },
      new Error('failed'),
    );
    instance.handlers.failed(undefined, new Error('missing-job'));
    expect(logger.log).toHaveBeenCalledWith(
      'Notification dispatch completed',
      expect.objectContaining({ notificationId: 'n1' }),
    );
    expect(logger.warn).toHaveBeenCalledTimes(2);

    await instance.processor({ data, attemptsMade: 0, opts: { attempts: 3 } });
    expect(notificationsService.processDispatchJob).toHaveBeenCalledWith(
      data,
      1,
    );
    await worker.onModuleDestroy();
    expect(instance.close).toHaveBeenCalled();
  });

  it('rethrows intermediate failures without dead-lettering', async () => {
    worker.onModuleInit();
    notificationsService.processDispatchJob.mockRejectedValue(
      new Error('temporary'),
    );
    await expect(
      mockWorkers[0].processor({
        data,
        attemptsMade: 0,
        opts: { attempts: 3 },
      }),
    ).rejects.toThrow('temporary');
    expect(queueService.enqueueDeadLetter).not.toHaveBeenCalled();
  });

  it('dead-letters Error and unknown failures on the last/default attempt', async () => {
    worker.onModuleInit();
    notificationsService.processDispatchJob.mockRejectedValueOnce(
      new Error('terminal'),
    );
    await expect(
      mockWorkers[0].processor({
        data,
        attemptsMade: 1,
        opts: { attempts: 2 },
      }),
    ).rejects.toThrow('terminal');
    expect(queueService.enqueueDeadLetter).toHaveBeenLastCalledWith(
      expect.objectContaining({
        error: 'terminal',
        attemptsMade: 2,
        payload: data,
      }),
    );
    expect(logger.error).toHaveBeenCalledWith(
      'Notification moved to dead-letter queue',
      'terminal',
      expect.objectContaining({ dlq: 'dlq' }),
    );

    notificationsService.processDispatchJob.mockRejectedValueOnce('unknown');
    await expect(
      mockWorkers[0].processor({ data, attemptsMade: 0, opts: {} }),
    ).rejects.toBe('unknown');
    expect(queueService.enqueueDeadLetter).toHaveBeenLastCalledWith(
      expect.objectContaining({
        error: 'Unknown dispatch error',
        attemptsMade: 1,
      }),
    );
  });

  it('uses default Redis connection values without a password', () => {
    expect(
      (worker as never as { getConnection(): unknown }).getConnection(),
    ).toEqual({
      host: '127.0.0.1',
      port: 6379,
      password: undefined,
      db: 0,
      maxRetriesPerRequest: null,
    });
  });
});
