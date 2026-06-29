import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import request from 'supertest';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import {
  REDIS_CLIENT,
  REDIS_PUB_CLIENT,
  REDIS_SUB_CLIENT,
} from '@/common/cache/cache.constants';

describe('application HTTP foundation (e2e)', () => {
  let app: INestApplication;
  let appService: AppService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, fallback?: unknown) => {
              const values: Record<string, unknown> = {
                env: 'test',
                'mongo.driver': 'local',
                'redis.driver': 'local',
              };
              return values[key] ?? fallback;
            },
          },
        },
        {
          provide: getConnectionToken(),
          useValue: {
            readyState: 0,
            name: 'e2e-isolated',
            host: 'in-memory',
          },
        },
        { provide: REDIS_CLIENT, useValue: null },
        { provide: REDIS_PUB_CLIENT, useValue: null },
        { provide: REDIS_SUB_CLIENT, useValue: null },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    appService = moduleRef.get(AppService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves root and liveness over the HTTP adapter', async () => {
    const root = await request(app.getHttpServer()).get('/').expect(200);
    const live = await request(app.getHttpServer()).get('/live').expect(200);

    expect(root.body).toMatchObject({
      message: 'Matrimony API is running ',
      version: 'v1',
    });
    expect(live.body).toMatchObject({ status: 'ok', env: 'test' });
  });

  it('reports dependency readiness and shutdown state', async () => {
    const ready = await request(app.getHttpServer()).get('/ready').expect(200);
    expect(ready.body).toMatchObject({
      status: 'ok',
      shuttingDown: false,
      dependencies: {
        mongo: { status: 'ok' },
        redis: { status: 'ok' },
      },
    });

    appService.markShuttingDown();
    const draining = await request(app.getHttpServer())
      .get('/ready')
      .expect(503);
    expect(draining.body).toMatchObject({
      status: 'degraded',
      shuttingDown: true,
    });
  });

  it('renders an accessible themed static page', async () => {
    const response = await request(app.getHttpServer())
      .get('/privacy-policy')
      .query({
        theme: 'dark',
        lang: 'hi',
        fontSize: 'large',
        boldText: 'true',
        highContrast: 'true',
        reduceMotion: 'true',
      })
      .expect(200)
      .expect('Content-Type', /text\/html/)
      .expect('Access-Control-Allow-Origin', '*');

    expect(response.text).toContain('<!doctype html>');
    expect(response.text).toContain('data-theme="dark"');
  });

  it('returns 404 for an unknown route', async () => {
    await request(app.getHttpServer()).get('/not-a-real-route').expect(404);
  });
});
