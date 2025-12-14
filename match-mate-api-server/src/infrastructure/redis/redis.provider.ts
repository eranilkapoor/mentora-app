import Redis from 'ioredis';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const REDIS = 'REDIS';

export const RedisProvider: Provider = {
  provide: REDIS,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const host = configService.get<string>('redis.host');
    const port = configService.get<number>('redis.port');

    console.log('REDIS CONFIG:', host, port); 

    return new Redis({
      host,
      port,
    });
  },
};
