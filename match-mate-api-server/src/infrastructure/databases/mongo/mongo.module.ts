import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

const logger = new Logger('MongoModule');

export const MongoModule = MongooseModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const driver = configService.get<string>('dbDriver', 'mongo');

    // ─── Local mode — skip MongoDB connection entirely ─────────────────────
    if (driver === 'local') {
      logger.log('⚠️  DB_DRIVER=local — skipping MongoDB connection');
      return {
        uri: 'mongodb://localhost:27017/local_dummy',
        retryAttempts: 0,        // don't retry
        retryDelay: 0,
        connectionFactory: (connection: any) => {
          // Close immediately — we don't need it in local mode
          connection.close();
          return connection;
        },
      };
    }

    // ─── Mongo mode ────────────────────────────────────────────────────────
    const uri = configService.get<string>('mongo.uri');

    if (!uri) {
      throw new Error('MONGO_URI is required when DB_DRIVER=mongo');
    }

    logger.log('✅ MongoDB connecting...');

    return {
      uri,
      retryAttempts: configService.get<number>('mongo.retryAttempts', 5),
      retryDelay: configService.get<number>('mongo.retryDelay', 5000),
    };
  },
});
