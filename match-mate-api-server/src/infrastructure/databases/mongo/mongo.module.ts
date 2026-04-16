import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppLogger } from 'src/common/logger/logger.service';

export const MongoModule = MongooseModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService, AppLogger],
  useFactory: (configService: ConfigService, logger: AppLogger) => {
    const driver = configService.getOrThrow<string>('mongo.dbDriver');

    // ─── Local mode — skip MongoDB connection entirely ─────────────────────
    if (driver === 'local') {
      logger.log('⚠️  DB_DRIVER=local — skipping MongoDB connection');
      return {
        uri: 'mongodb://localhost:27017/local_dummy',
        retryAttempts: 0, // don't retry
        retryDelay: 0,
        connectionFactory: (connection: any) => {
          // Close immediately — we don't need it in local mode
          connection.close();
          return connection;
        },
      };
    }

    // ─── Mongo mode ────────────────────────────────────────────────────────
    const uri = configService.getOrThrow<string>('mongo.uri');

    if (!uri) {
      throw new Error('MONGO_URI is required when DB_DRIVER=mongo');
    }

    logger.log('✅ MongoDB connecting...');

    return {
      uri,
      retryAttempts: configService.getOrThrow<number>('mongo.retryAttempts', 5),
      retryDelay: configService.getOrThrow<number>('mongo.retryDelay', 5000),
    };
  },
});
