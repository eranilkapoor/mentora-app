import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, JobsOptions, Queue } from 'bullmq';
import { RedisOptions } from 'ioredis';
import { AppLogger } from '@/common/logger/logger.service';

export interface NotificationDispatchJobData {
  notificationId: string;
  userId: string;
  email?: string;
  phone?: string;
  title: string;
  message: string;
  subject: string;
  emailBody?: string;
  smsBody?: string;
  templateKey?: string;
  metadata?: Record<string, unknown>;
  decision: {
    inApp: boolean;
    push: boolean;
    email: boolean;
    sms: boolean;
  };
}

export interface NotificationDeadLetterJobData {
  notificationId: string;
  error: string;
  attemptsMade: number;
  failedAt: string;
  payload: NotificationDispatchJobData;
  replayCount?: number;
  lastReplayAt?: string;
  lastReplayBy?: string;
}

const DLQ_JOB_STATES = [
  'waiting',
  'active',
  'completed',
  'failed',
  'delayed',
  'paused',
] as const;

type DlqJobState = (typeof DLQ_JOB_STATES)[number];

interface ReplayDeadLettersBulkQuery {
  state?: DlqJobState;
  limit: number;
  olderThanDays?: number;
  intervalMs: number;
  replayedBy?: string;
}

interface PurgeDeadLettersQuery {
  state?: DlqJobState;
  limit: number;
  olderThanDays?: number;
}

@Injectable()
export class NotificationQueueService implements OnModuleInit, OnModuleDestroy {
  private dispatchQueue?: Queue<NotificationDispatchJobData>;
  private deadLetterQueue?: Queue<NotificationDeadLetterJobData>;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  onModuleInit() {
    if (!this.isEnabled()) {
      return;
    }

    const connection = this.getConnection();
    this.dispatchQueue = new Queue<NotificationDispatchJobData>(
      this.getQueueName(),
      {
        connection,
      },
    );
    this.deadLetterQueue = new Queue<NotificationDeadLetterJobData>(
      this.getDlqName(),
      {
        connection,
      },
    );

    this.logger.log('Notification queue initialized', {
      queue: this.getQueueName(),
      dlq: this.getDlqName(),
    });
  }

  async onModuleDestroy() {
    await Promise.all([
      this.dispatchQueue?.close(),
      this.deadLetterQueue?.close(),
    ]);
  }

  isEnabled() {
    return this.configService.get<boolean>('notification.queue.enabled', false);
  }

  getQueueName() {
    return this.configService.get<string>(
      'notification.queue.name',
      'notification-dispatch',
    );
  }

  getDlqName() {
    return this.configService.get<string>(
      'notification.queue.dlqName',
      'notification-dispatch-dlq',
    );
  }

  getConcurrency() {
    return this.configService.get<number>('notification.queue.concurrency', 5);
  }

  async enqueueDispatch(
    data: NotificationDispatchJobData,
    options?: JobsOptions,
  ) {
    if (!this.dispatchQueue) {
      throw new Error('Notification queue is not initialized');
    }

    const attempts = this.configService.get<number>(
      'notification.queue.attempts',
      5,
    );
    const backoffMs = this.configService.get<number>(
      'notification.queue.backoffMs',
      3000,
    );

    return this.dispatchQueue.add('dispatch-notification', data, {
      jobId: `notification:${data.notificationId}`,
      removeOnComplete: true,
      removeOnFail: 500,
      attempts,
      backoff: {
        type: 'exponential',
        delay: backoffMs,
      },
      ...options,
    });
  }

  async enqueueDeadLetter(data: NotificationDeadLetterJobData) {
    if (!this.deadLetterQueue) {
      throw new Error('Notification dead-letter queue is not initialized');
    }

    await this.deadLetterQueue.add('notification-dead-letter', data, {
      removeOnComplete: false,
      removeOnFail: false,
    });
  }

  async listDeadLetters(query: {
    page: number;
    limit: number;
    state?: DlqJobState;
  }) {
    this.ensureQueueReady();

    const page = Math.max(query.page, 1);
    const limit = Math.max(query.limit, 1);
    const states = query.state ? [query.state] : [...DLQ_JOB_STATES];
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const [jobs, counts] = await Promise.all([
      this.deadLetterQueue!.getJobs(states, start, end, true),
      this.deadLetterQueue!.getJobCounts(...states),
    ]);

    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

    return {
      page,
      limit,
      total,
      hasMore: start + jobs.length < total,
      items: await Promise.all(jobs.map((job) => this.mapDlqJob(job))),
    };
  }

  async getDeadLetter(jobId: string) {
    this.ensureQueueReady();
    const job = await this.deadLetterQueue!.getJob(jobId);

    if (!job) {
      return null;
    }

    return this.mapDlqJob(job);
  }

  async replayDeadLetter(jobId: string, replayedBy?: string) {
    this.ensureQueueReady();

    const job = await this.deadLetterQueue!.getJob(jobId);
    if (!job) {
      return null;
    }

    const replayCount = (job.data.replayCount ?? 0) + 1;
    const replayedAt = new Date().toISOString();

    await this.enqueueDispatch(job.data.payload, {
      jobId: `notification:${job.data.payload.notificationId}:replay:${Date.now()}`,
    });

    await job.updateData({
      ...job.data,
      replayCount,
      lastReplayAt: replayedAt,
      lastReplayBy: replayedBy,
    });

    return {
      replayQueued: true,
      replayCount,
      replayedAt,
      job: await this.mapDlqJob(job),
    };
  }

  async replayDeadLettersBulk(query: ReplayDeadLettersBulkQuery) {
    this.ensureQueueReady();

    const limit = Math.max(query.limit, 1);
    const states = query.state ? [query.state] : [...DLQ_JOB_STATES];
    const jobs = await this.deadLetterQueue!.getJobs(
      states,
      0,
      limit - 1,
      true,
    );
    const filteredJobs = this.filterJobsByAge(jobs, query.olderThanDays);

    let scheduled = 0;
    let failedToSchedule = 0;

    for (const [index, job] of filteredJobs.entries()) {
      try {
        await this.enqueueDispatch(job.data.payload, {
          jobId: `notification:${job.data.payload.notificationId}:bulk-replay:${Date.now()}:${index}`,
          delay: Math.max(query.intervalMs, 0) * index,
        });

        const replayCount = (job.data.replayCount ?? 0) + 1;
        await job.updateData({
          ...job.data,
          replayCount,
          lastReplayAt: new Date().toISOString(),
          lastReplayBy: query.replayedBy,
        });
        scheduled += 1;
      } catch (error) {
        failedToSchedule += 1;
        const message =
          error instanceof Error
            ? error.message
            : 'DLQ replay scheduling failed';
        this.logger.warn('Failed to schedule DLQ replay', {
          jobId: job.id,
          error: message,
        });
      }
    }

    return {
      requestedLimit: limit,
      matched: filteredJobs.length,
      scheduled,
      failedToSchedule,
      intervalMs: Math.max(query.intervalMs, 0),
      state: query.state ?? null,
      olderThanDays: query.olderThanDays ?? null,
    };
  }

  async purgeDeadLetters(query: PurgeDeadLettersQuery) {
    this.ensureQueueReady();

    const limit = Math.max(query.limit, 1);
    const states = query.state ? [query.state] : [...DLQ_JOB_STATES];
    const jobs = await this.deadLetterQueue!.getJobs(
      states,
      0,
      limit - 1,
      true,
    );
    const filteredJobs = this.filterJobsByAge(jobs, query.olderThanDays);

    let deleted = 0;
    let failed = 0;

    for (const job of filteredJobs) {
      try {
        await job.remove();
        deleted += 1;
      } catch (error) {
        failed += 1;
        const message =
          error instanceof Error ? error.message : 'DLQ purge failed';
        this.logger.warn('Failed to purge DLQ job', {
          jobId: job.id,
          error: message,
        });
      }
    }

    return {
      requestedLimit: limit,
      matched: filteredJobs.length,
      deleted,
      failed,
      state: query.state ?? null,
      olderThanDays: query.olderThanDays ?? null,
    };
  }

  getDlqStates() {
    return [...DLQ_JOB_STATES];
  }

  private ensureQueueReady() {
    if (!this.deadLetterQueue || !this.dispatchQueue) {
      throw new Error('Notification queue is not initialized');
    }
  }

  private async mapDlqJob(job: Job<NotificationDeadLetterJobData>) {
    const state = await job.getState();

    return {
      id: String(job.id),
      name: job.name,
      state,
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp,
      processedOn: job.processedOn ?? null,
      finishedOn: job.finishedOn ?? null,
      delay: job.delay,
      priority: job.opts.priority ?? null,
      data: job.data,
    };
  }

  private filterJobsByAge(
    jobs: Array<Job<NotificationDeadLetterJobData>>,
    olderThanDays?: number,
  ) {
    if (!olderThanDays || olderThanDays <= 0) {
      return jobs;
    }

    const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    return jobs.filter((job) => {
      const failedAt = Date.parse(job.data.failedAt || '');
      if (!Number.isNaN(failedAt)) {
        return failedAt <= cutoff;
      }

      return job.timestamp <= cutoff;
    });
  }

  private getConnection(): RedisOptions {
    return {
      host: this.configService.get<string>('redis.host', '127.0.0.1'),
      port: this.configService.get<number>('redis.port', 6379),
      password: this.configService.get<string>('redis.password') || undefined,
      db: Number(this.configService.get<number | string>('redis.db', 0)),
      maxRetriesPerRequest: null,
    };
  }
}
