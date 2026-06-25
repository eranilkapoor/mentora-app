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
});
