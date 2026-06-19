import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import Redis from 'ioredis';
import { Connection } from 'mongoose';
import {
  REDIS_CLIENT,
  REDIS_PUB_CLIENT,
  REDIS_SUB_CLIENT,
} from '@/common/cache/cache.constants';
import {
  getStaticPageHtml,
  StaticPageRenderOptions,
  StaticPageSlug,
} from '@/common/static-pages/static-page-renderer';

export type HealthStatus = 'ok' | 'degraded';

export interface DependencyHealth {
  status: HealthStatus;
  details: Record<string, unknown>;
}

@Injectable()
export class AppService {
  private shuttingDown = false;

  constructor(
    private readonly configService: ConfigService,
    @InjectConnection() private readonly mongoConnection: Connection,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis | null,
    @Inject(REDIS_PUB_CLIENT) private readonly redisPubClient: Redis | null,
    @Inject(REDIS_SUB_CLIENT) private readonly redisSubClient: Redis | null,
  ) {}

  getRoot() {
    return {
      message: 'Matrimony API is running ',
      version: 'v1',
      timestamp: new Date().toISOString(),
    };
  }

  getAccountDeletionInstructionsPage(
    optionsOrTheme?: StaticPageRenderOptions | string,
    legacyLanguage?: string,
  ): string {
    return getStaticPageHtml(
      'account-deletion',
      optionsOrTheme,
      legacyLanguage,
    );
  }

  getStaticHelpPage(
    slug: StaticPageSlug,
    optionsOrTheme?: StaticPageRenderOptions | string,
    legacyLanguage?: string,
  ): string {
    return getStaticPageHtml(slug, optionsOrTheme, legacyLanguage);
  }

  markShuttingDown(): void {
    this.shuttingDown = true;
  }

  livenessCheck() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      env: this.configService.get<string>('env'),
      memory: {
        rss: process.memoryUsage().rss,
        heapUsed: process.memoryUsage().heapUsed,
      },
    };
  }

  readinessCheck() {
    const mongo = this.getMongoHealth();
    const redis = this.getRedisHealth();
    const dependencies = { mongo, redis };
    const isReady =
      !this.shuttingDown &&
      Object.values(dependencies).every(
        (dependency) => dependency.status === 'ok',
      );

    return {
      status: isReady ? 'ok' : 'degraded',
      shuttingDown: this.shuttingDown,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      dependencies,
    };
  }

  private getMongoHealth(): DependencyHealth {
    const driver = this.configService.get<string>('mongo.driver', 'mongo');

    if (driver === 'local') {
      return {
        status: 'ok',
        details: { driver, skipped: true },
      };
    }

    const readyState = Number(this.mongoConnection.readyState);

    return {
      status: readyState === 1 ? 'ok' : 'degraded',
      details: {
        driver,
        readyState,
        state: this.resolveMongoState(readyState),
        name: this.mongoConnection.name,
        host: this.mongoConnection.host,
      },
    };
  }

  private getRedisHealth(): DependencyHealth {
    const driver = this.configService.get<string>('redis.driver', 'local');

    if (driver !== 'redis') {
      return {
        status: 'ok',
        details: { driver, skipped: true },
      };
    }

    const clients = {
      main: this.redisClient?.status ?? 'missing',
      pub: this.redisPubClient?.status ?? 'missing',
      sub: this.redisSubClient?.status ?? 'missing',
    };
    const allReady = Object.values(clients).every(
      (status) => status === 'ready',
    );

    return {
      status: allReady ? 'ok' : 'degraded',
      details: {
        driver,
        clients,
      },
    };
  }

  private resolveMongoState(readyState: number): string {
    switch (readyState) {
      case 0:
        return 'disconnected';
      case 1:
        return 'connected';
      case 2:
        return 'connecting';
      case 3:
        return 'disconnecting';
      default:
        return 'unknown';
    }
  }
}
