import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CACHE_SERVICE } from './cache.interface';
import { RedisCacheService } from './redis-cache.service';
import { LocalCacheService } from './local-cache.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: CACHE_SERVICE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const driver = config.get<string>('cacheDriver', 'local');

        if (driver === 'redis') {
          return new RedisCacheService(config);
        }

        return new LocalCacheService(config);
      },
    },
  ],
  exports: [CACHE_SERVICE],
})
export class CacheModule {}
