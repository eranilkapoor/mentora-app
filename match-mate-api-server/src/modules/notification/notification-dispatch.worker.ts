import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Worker } from 'bullmq';
import { RedisOptions } from 'ioredis';
import { AppLogger } from 'src/common/logger/logger.service';
import {
  NotificationDispatchJobData,
  NotificationQueueService,
} from './services/notification-queue.service';
import { NotificationService } from './services/notification.service';

@Injectable()
export class NotificationDispatchWorker
  implements OnModuleInit, OnModuleDestroy
{
  private worker?: Worker<NotificationDispatchJobData>;

  constructor(
    private readonly queueService: NotificationQueueService,
    private readonly notificationService: NotificationService,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  onModuleInit() {
    if (!this.queueService.isEnabled()) {
      this.logger.log('Notification worker disabled (queue disabled)');
      return;
    }

    this.worker = new Worker<NotificationDispatchJobData>(
      this.queueService.getQueueName(),
      async (job) => this.process(job),
      {
        connection: this.getConnection(),
        concurrency: this.queueService.getConcurrency(),
      },
    );

    this.worker.on('completed', (job) => {
      this.logger.log('Notification dispatch completed', {
        jobId: job.id,
        notificationId: job.data.notificationId,
      });
    });

    this.worker.on('failed', (job, error) => {
      this.logger.warn('Notification dispatch attempt failed', {
        jobId: job?.id,
        notificationId: job?.data.notificationId,
        attemptsMade: job?.attemptsMade,
        error: error.message,
      });
    });

    this.logger.log('Notification worker started', {
      queue: this.queueService.getQueueName(),
      concurrency: this.queueService.getConcurrency(),
    });
  }

  async onModuleDestroy() {
    await this.worker?.close();
  }

  private async process(job: Job<NotificationDispatchJobData>) {
    const attemptNo = job.attemptsMade + 1;

    try {
      await this.notificationService.processDispatchJob(job.data, attemptNo);
    } catch (error) {
      const maxAttempts = job.opts.attempts ?? 1;
      const isLastAttempt = attemptNo >= maxAttempts;

      if (isLastAttempt) {
        const message =
          error instanceof Error ? error.message : 'Unknown dispatch error';
        await this.queueService.enqueueDeadLetter({
          notificationId: job.data.notificationId,
          error: message,
          attemptsMade: attemptNo,
          failedAt: new Date().toISOString(),
          payload: job.data,
        });

        this.logger.error('Notification moved to dead-letter queue', message, {
          notificationId: job.data.notificationId,
          attemptsMade: attemptNo,
          dlq: this.queueService.getDlqName(),
        });
      }

      throw error;
    }
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
