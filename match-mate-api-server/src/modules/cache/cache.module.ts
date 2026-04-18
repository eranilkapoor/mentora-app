import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CACHE_SERVICE } from './cache.interface';
import { RedisCacheService } from './redis-cache.service';
import { LocalCacheService } from './local-cache.service';
import { AppLogger } from 'src/common/logger/logger.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: CACHE_SERVICE,
      inject: [ConfigService, AppLogger],
      useFactory: (configService: ConfigService, logger: AppLogger) => {
        const driver = configService.get<string>('redis.driver', 'local');

        if (driver === 'redis') {
          return new RedisCacheService(configService, logger);
        }

        return new LocalCacheService(logger);
      },
    },
  ],
  exports: [CACHE_SERVICE],
})
export class CacheModule {}
