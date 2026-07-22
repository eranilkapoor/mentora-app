const mockQueueInstances: Array<Record<string, jest.Mock>> = [];
jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => {
    const instance = { close: jest.fn().mockResolvedValue(undefined) };
    mockQueueInstances.push(instance);
    return instance;
  }),
}));

import { NotificationQueueService } from './notification-queue.service';

type ConfigValues = Record<string, unknown>;

const asRecord = (value: unknown): Record<string, unknown> => {
  expect(value).not.toBeNull();
  expect(typeof value).toBe('object');
  return value as Record<string, unknown>;
};

const createConfigService = (values: ConfigValues) => ({
  get: jest.fn((key: string, defaultValue?: unknown) =>
    Object.prototype.hasOwnProperty.call(values, key)
      ? values[key]
      : defaultValue,
  ),
});

const createService = (values: ConfigValues = {}) => {
  const config = createConfigService({
    'notification.queue.enabled': true,
    'notification.queue.attempts': 4,
    'notification.queue.backoffMs': 1500,
    ...values,
  });
  const logger = {
    log: jest.fn(),
    warn: jest.fn(),
  };

  const service = new NotificationQueueService(
    config as never,
    logger as never,
  );

  return {
    service,
    config,
    logger,
  };
};

describe('NotificationQueueService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQueueInstances.length = 0;
  });

  it('returns queue enabled flag from config', () => {
    const enabled = createService({ 'notification.queue.enabled': true });
    const disabled = createService({ 'notification.queue.enabled': false });

    expect(enabled.service.isEnabled()).toBe(true);
    expect(disabled.service.isEnabled()).toBe(false);
  });

  it('throws when enqueueDispatch is called before queue initialization', async () => {
    const { service } = createService();

    await expect(
      service.enqueueDispatch({
        notificationId: 'n1',
        userId: 'u1',
        title: 'Title',
        message: 'Body',
        subject: 'Subject',
        decision: { inApp: true, push: true, email: false, sms: false },
      }),
    ).rejects.toThrow('Notification queue is not initialized');
  });

  it('enqueues dispatch with configured retry/backoff defaults', async () => {
    const { service } = createService();
    const add = jest.fn().mockResolvedValue({ id: 'job-1' });
    (service as never as { dispatchQueue: { add: typeof add } }).dispatchQueue =
      {
        add,
      };

    await service.enqueueDispatch(
      {
        notificationId: 'n1',
        userId: 'u1',
        title: 'Title',
        message: 'Body',
        subject: 'Subject',
        decision: { inApp: true, push: true, email: false, sms: false },
      },
      { delay: 500 },
    );

    expect(add).toHaveBeenCalledWith(
      'dispatch-notification',
      expect.objectContaining({ notificationId: 'n1' }),
      expect.objectContaining({
        jobId: 'notification:n1',
        attempts: 4,
        delay: 500,
        backoff: { type: 'exponential', delay: 1500 },
      }),
    );
  });

  it('lists DLQ jobs with pagination metadata', async () => {
    const { service } = createService();
    (service as never as { dispatchQueue: object }).dispatchQueue = {};

    const job = {
      id: 'dlq-1',
      name: 'notification-dead-letter',
      attemptsMade: 2,
      timestamp: Date.now(),
      processedOn: Date.now(),
      finishedOn: Date.now(),
      delay: 0,
      opts: { priority: 3 },
      data: {
        notificationId: 'n1',
        error: 'failed',
        attemptsMade: 2,
        failedAt: new Date().toISOString(),
        payload: {
          notificationId: 'n1',
          userId: 'u1',
          title: 'Title',
          message: 'Body',
          subject: 'Subject',
          decision: { inApp: true, push: true, email: false, sms: false },
        },
      },
      getState: jest.fn().mockResolvedValue('failed'),
    };

    (
      service as never as {
        deadLetterQueue: {
          getJobs: jest.Mock;
          getJobCounts: jest.Mock;
        };
      }
    ).deadLetterQueue = {
      getJobs: jest.fn().mockResolvedValue([job]),
      getJobCounts: jest.fn().mockResolvedValue({ failed: 2, waiting: 1 }),
    };

    const result: unknown = await service.listDeadLetters({
      page: 1,
      limit: 1,
    });
    const resultRecord = asRecord(result);
    const items = resultRecord.items as unknown[];
    const firstItem = asRecord(items[0]);
    const firstData = asRecord(firstItem.data);

    expect(resultRecord.total).toBe(3);
    expect(resultRecord.hasMore).toBe(true);
    expect(items).toHaveLength(1);
    expect(firstItem.id).toBe('dlq-1');
    expect(firstItem.state).toBe('failed');
    expect(firstData.notificationId).toBe('n1');
  });

  it('replays a DLQ job and updates replay metadata', async () => {
    const { service } = createService();
    const payload = {
      notificationId: 'n1',
      userId: 'u1',
      title: 'Title',
      message: 'Body',
      subject: 'Subject',
      decision: { inApp: true, push: true, email: false, sms: false },
    };

    const updateData = jest.fn().mockResolvedValue(undefined);
    const job = {
      id: 'dlq-1',
      name: 'notification-dead-letter',
      attemptsMade: 1,
      timestamp: Date.now(),
      processedOn: null,
      finishedOn: null,
      delay: 0,
      opts: {},
      data: {
        notificationId: 'n1',
        error: 'boom',
        attemptsMade: 1,
        failedAt: new Date().toISOString(),
        payload,
      },
      getState: jest.fn().mockResolvedValue('failed'),
      updateData,
    };

    const enqueueDispatch = jest
      .spyOn(service, 'enqueueDispatch')
      .mockResolvedValue({} as never);

    (service as never as { dispatchQueue: object }).dispatchQueue = {};
    (
      service as never as {
        deadLetterQueue: {
          getJob: jest.Mock;
        };
      }
    ).deadLetterQueue = {
      getJob: jest.fn().mockResolvedValue(job),
    };

    const result: unknown = await service.replayDeadLetter('dlq-1', 'admin-1');
    const resultRecord = asRecord(result);

    expect(enqueueDispatch).toHaveBeenCalledTimes(1);
    const replayCall = enqueueDispatch.mock.calls[0] as unknown[];
    const replayPayload = replayCall[0];
    const replayOptions = asRecord(replayCall[1]);

    expect(replayPayload).toEqual(payload);
    expect(replayOptions.jobId).toEqual(
      expect.stringContaining('notification:n1:replay:'),
    );
    expect(updateData).toHaveBeenCalledWith(
      expect.objectContaining({
        replayCount: 1,
        lastReplayBy: 'admin-1',
      }),
    );
    expect(resultRecord.replayQueued).toBe(true);
    expect(resultRecord.replayCount).toBe(1);
  });

  it('reports partial failures while purging DLQ jobs', async () => {
    const { service, logger } = createService();
    (service as never as { dispatchQueue: object }).dispatchQueue = {};

    const removableJob = {
      data: { failedAt: new Date().toISOString() },
      remove: jest.fn().mockResolvedValue(undefined),
    };
    const failingJob = {
      data: { failedAt: new Date().toISOString() },
      remove: jest.fn().mockRejectedValue(new Error('cannot-delete')),
      id: 'dlq-2',
    };

    (
      service as never as {
        deadLetterQueue: {
          getJobs: jest.Mock;
        };
      }
    ).deadLetterQueue = {
      getJobs: jest.fn().mockResolvedValue([removableJob, failingJob]),
    };

    const result: unknown = await service.purgeDeadLetters({ limit: 10 });
    const resultRecord = asRecord(result);

    expect(resultRecord.matched).toBe(2);
    expect(resultRecord.deleted).toBe(1);
    expect(resultRecord.failed).toBe(1);
    expect(logger.warn).toHaveBeenCalledWith('Failed to purge DLQ job', {
      jobId: 'dlq-2',
      error: 'cannot-delete',
    });
  });

  it('initializes configured queues, exposes names/concurrency, and closes them', async () => {
    const disabled = createService({ 'notification.queue.enabled': false });
    disabled.service.onModuleInit();
    expect(mockQueueInstances).toHaveLength(0);
    await disabled.service.onModuleDestroy();

    const { service, logger } = createService({
      'notification.queue.name': 'dispatch',
      'notification.queue.dlqName': 'dead-letter',
      'notification.queue.concurrency': 8,
      'redis.host': 'redis',
      'redis.port': 6380,
      'redis.password': 'secret',
      'redis.db': '2',
    });
    service.onModuleInit();
    expect(mockQueueInstances).toHaveLength(2);
    expect(service.getQueueName()).toBe('dispatch');
    expect(service.getDlqName()).toBe('dead-letter');
    expect(service.getConcurrency()).toBe(8);
    expect(logger.log).toHaveBeenCalledWith(
      'Notification queue initialized',
      expect.any(Object),
    );
    await service.onModuleDestroy();
    expect(mockQueueInstances[0].close).toHaveBeenCalled();
    expect(mockQueueInstances[1].close).toHaveBeenCalled();

    const defaults = createService();
    expect(defaults.service.getQueueName()).toBe('notification-dispatch');
    expect(defaults.service.getDlqName()).toBe('notification-dispatch-dlq');
    expect(defaults.service.getConcurrency()).toBe(5);
    expect(
      (
        defaults.service as never as { getConnection(): unknown }
      ).getConnection(),
    ).toMatchObject({
      password: undefined,
      db: 0,
    });
  });

  it('enqueues dead letters and rejects unavailable DLQ operations', async () => {
    const { service } = createService();
    await expect(
      service.enqueueDeadLetter({
        notificationId: 'n1',
        error: 'failed',
        attemptsMade: 1,
        failedAt: new Date().toISOString(),
        payload: {
          notificationId: 'n1',
          userId: 'u1',
          title: 'Title',
          message: 'Body',
          subject: 'Subject',
          decision: { inApp: true, push: false, email: false, sms: false },
        },
      }),
    ).rejects.toThrow('Notification dead-letter queue is not initialized');
    await expect(service.getDeadLetter('missing')).rejects.toThrow(
      'Notification queue is not initialized',
    );

    const add = jest.fn().mockResolvedValue(undefined);
    (
      service as never as { deadLetterQueue: { add: typeof add } }
    ).deadLetterQueue = { add };
    await service.enqueueDeadLetter({
      notificationId: 'n1',
      error: 'failed',
      attemptsMade: 1,
      failedAt: new Date().toISOString(),
      payload: {
        notificationId: 'n1',
        userId: 'u1',
        title: 'Title',
        message: 'Body',
        subject: 'Subject',
        decision: { inApp: true, push: false, email: false, sms: false },
      },
    });
    expect(add).toHaveBeenCalledWith(
      'notification-dead-letter',
      expect.any(Object),
      { removeOnComplete: false, removeOnFail: false },
    );
  });

  it('gets missing and mapped dead-letter jobs with nullable metadata', async () => {
    const { service } = createService();
    (service as never as { dispatchQueue: object }).dispatchQueue = {};
    const getJob = jest.fn().mockResolvedValue(null);
    (
      service as never as { deadLetterQueue: { getJob: typeof getJob } }
    ).deadLetterQueue = {
      getJob,
    };
    await expect(service.getDeadLetter('missing')).resolves.toBeNull();

    getJob.mockResolvedValue({
      id: 2,
      name: 'dead',
      attemptsMade: 0,
      timestamp: Date.now(),
      processedOn: undefined,
      finishedOn: undefined,
      delay: 0,
      opts: {},
      data: {},
      getState: jest.fn().mockResolvedValue('waiting'),
    });
    await expect(service.getDeadLetter('2')).resolves.toMatchObject({
      id: '2',
      processedOn: null,
      finishedOn: null,
      priority: null,
    });
    getJob.mockResolvedValue(null);
    await expect(service.replayDeadLetter('missing')).resolves.toBeNull();
  });

  it('bulk replays filtered DLQ jobs and reports scheduling failures', async () => {
    const { service, logger } = createService();
    (service as never as { dispatchQueue: object }).dispatchQueue = {};
    const oldDate = new Date(Date.now() - 10 * 86_400_000).toISOString();
    const createJob = (id: string, failedAt: string, replayCount?: number) => ({
      id,
      timestamp: Date.now() - 10 * 86_400_000,
      data: {
        failedAt,
        replayCount,
        payload: { notificationId: id },
      },
      updateData: jest.fn().mockResolvedValue(undefined),
    });
    const first = createJob('n1', oldDate, 2);
    const second = createJob('n2', 'invalid');
    const recent = createJob('n3', new Date().toISOString());
    const getJobs = jest.fn().mockResolvedValue([first, second, recent]);
    (
      service as never as { deadLetterQueue: { getJobs: typeof getJobs } }
    ).deadLetterQueue = {
      getJobs,
    };
    jest
      .spyOn(service, 'enqueueDispatch')
      .mockResolvedValueOnce({} as never)
      .mockRejectedValueOnce('failed');
    await expect(
      service.replayDeadLettersBulk({
        state: 'failed',
        limit: 0,
        olderThanDays: 5,
        intervalMs: -1,
        replayedBy: 'admin',
      }),
    ).resolves.toMatchObject({
      requestedLimit: 1,
      matched: 2,
      scheduled: 1,
      failedToSchedule: 1,
      intervalMs: 0,
      state: 'failed',
      olderThanDays: 5,
    });
    expect(first.updateData).toHaveBeenCalledWith(
      expect.objectContaining({ replayCount: 3, lastReplayBy: 'admin' }),
    );
    expect(logger.warn).toHaveBeenCalledWith(
      'Failed to schedule DLQ replay',
      expect.objectContaining({ error: 'DLQ replay scheduling failed' }),
    );
  });

  it('covers default bulk/purge metadata, age bypass, and non-error purge failures', async () => {
    const { service, logger } = createService();
    (service as never as { dispatchQueue: object }).dispatchQueue = {};
    const job = {
      id: 'n1',
      timestamp: Date.now(),
      data: { failedAt: '', payload: { notificationId: 'n1' } },
      updateData: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn().mockRejectedValue('failed'),
    };
    const getJobs = jest.fn().mockResolvedValue([job]);
    (
      service as never as { deadLetterQueue: { getJobs: typeof getJobs } }
    ).deadLetterQueue = {
      getJobs,
    };
    jest.spyOn(service, 'enqueueDispatch').mockResolvedValue({} as never);
    await expect(
      service.replayDeadLettersBulk({ limit: 1, intervalMs: 5 }),
    ).resolves.toMatchObject({ state: null, olderThanDays: null });
    await expect(
      service.purgeDeadLetters({ limit: 0, olderThanDays: 0 }),
    ).resolves.toMatchObject({
      requestedLimit: 1,
      state: null,
      olderThanDays: 0,
      failed: 1,
    });
    expect(logger.warn).toHaveBeenCalledWith(
      'Failed to purge DLQ job',
      expect.objectContaining({ error: 'DLQ purge failed' }),
    );
    expect(service.getDlqStates()).toContain('failed');
  });

  it('covers state filters, Error replay failures, and missing failure timestamps', async () => {
    const { service, logger } = createService();
    (service as never as { dispatchQueue: object }).dispatchQueue = {};
    const job = {
      id: 'n1',
      timestamp: Date.now() - 10 * 86_400_000,
      data: { payload: { notificationId: 'n1' } },
      getState: jest.fn().mockResolvedValue('failed'),
      updateData: jest.fn(),
      remove: jest.fn().mockResolvedValue(undefined),
      opts: {},
    };
    const getJobs = jest.fn().mockResolvedValue([job]);
    const getJobCounts = jest.fn().mockResolvedValue({ failed: 1 });
    (
      service as never as {
        deadLetterQueue: {
          getJobs: typeof getJobs;
          getJobCounts: typeof getJobCounts;
        };
      }
    ).deadLetterQueue = { getJobs, getJobCounts };
    await service.listDeadLetters({ page: 0, limit: 0, state: 'failed' });

    jest
      .spyOn(service, 'enqueueDispatch')
      .mockRejectedValue(new Error('cannot-replay'));
    await service.replayDeadLettersBulk({
      state: 'failed',
      limit: 1,
      olderThanDays: 5,
      intervalMs: 0,
    });
    expect(logger.warn).toHaveBeenCalledWith(
      'Failed to schedule DLQ replay',
      expect.objectContaining({ error: 'cannot-replay' }),
    );
    await expect(
      service.purgeDeadLetters({ state: 'failed', limit: 1 }),
    ).resolves.toMatchObject({ state: 'failed', deleted: 1 });
  });
});
