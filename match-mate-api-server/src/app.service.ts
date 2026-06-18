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

  getAccountDeletionInstructionsPage(): string {
    const appUrl = this.configService.get<string>('app.webUrl') || '';
    const supportEmail = 'support@matchmate.webnza.com';

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Delete Your Match Mate Account</title>
    <style>
      body { margin: 0; font-family: Arial, sans-serif; background: #fff7f9; color: #231f20; }
      main { max-width: 760px; margin: 0 auto; padding: 48px 20px; line-height: 1.6; }
      h1 { color: #d81b60; margin-bottom: 12px; }
      h2 { margin-top: 32px; color: #3a2f34; }
      .card { background: #ffffff; border: 1px solid #f4ccd8; border-radius: 12px; padding: 24px; box-shadow: 0 12px 30px rgba(216, 27, 96, 0.08); }
      a { color: #d81b60; font-weight: 700; }
      li { margin-bottom: 8px; }
    </style>
  </head>
  <body>
    <main>
      <div class="card">
        <h1>Delete Your Match Mate Account</h1>
        <p>You can request account deletion from inside the Match Mate app at any time.</p>
        <h2>Steps in the app</h2>
        <ol>
          <li>Open Match Mate and sign in.</li>
          <li>Go to Settings.</li>
          <li>Open Account Settings.</li>
          <li>Select Delete Account.</li>
          <li>Confirm the deletion request.</li>
        </ol>
        <h2>What gets deleted</h2>
        <p>Your profile, preferences, settings, sessions, notifications, and uploaded personal media are scheduled for deletion or anonymization according to our account deletion policy.</p>
        <h2>Need help?</h2>
        <p>If you cannot access the app, email <a href="mailto:${supportEmail}">${supportEmail}</a> from your registered email address.</p>
        ${appUrl ? `<p>Website: <a href="${appUrl}">${appUrl}</a></p>` : ''}
      </div>
    </main>
  </body>
</html>`;
  }

  getStaticHelpPage(
    slug: StaticPageSlug,
    theme?: string,
    language?: string,
  ): string {
    return getStaticPageHtml(slug, theme, language);
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
