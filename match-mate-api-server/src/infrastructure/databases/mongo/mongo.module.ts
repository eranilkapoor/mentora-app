import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';
import { AppLogger } from '@/common/logger/logger.service';

type MongoConnectionConfig = {
  uri: string;
  writeConcern?: Record<string, unknown>;
};

const encodeCredential = (value: string): string => {
  try {
    return encodeURIComponent(decodeURIComponent(value));
  } catch {
    return encodeURIComponent(value);
  }
};

const encodeMongoCredentials = (uri: string): string => {
  const protocolMatch = uri.match(/^mongodb(\+srv)?:\/\//);
  if (!protocolMatch) {
    return uri;
  }

  const protocol = protocolMatch[0];
  const withoutProtocol = uri.slice(protocol.length);
  const pathIndex = withoutProtocol.indexOf('/');
  const authority =
    pathIndex >= 0 ? withoutProtocol.slice(0, pathIndex) : withoutProtocol;
  const rest = pathIndex >= 0 ? withoutProtocol.slice(pathIndex) : '';
  const atIndex = authority.lastIndexOf('@');
  if (atIndex < 0) {
    return uri;
  }

  const credentials = authority.slice(0, atIndex);
  const hosts = authority.slice(atIndex + 1);
  const colonIndex = credentials.indexOf(':');
  if (colonIndex < 0) {
    return uri;
  }

  const username = credentials.slice(0, colonIndex);
  const password = credentials.slice(colonIndex + 1);

  return `${protocol}${encodeCredential(username)}:${encodeCredential(
    password,
  )}@${hosts}${rest}`;
};

const extractWriteConcern = (
  searchParams: URLSearchParams,
): Record<string, unknown> | null => {
  const writeConcern: Record<string, unknown> = {};
  const w = searchParams.get('w');
  const wtimeout = searchParams.get('wtimeout');
  const j = searchParams.get('j');
  const fsync = searchParams.get('fsync');

  if (w) {
    writeConcern.w = Number.isNaN(Number(w)) ? w : Number(w);
    searchParams.delete('w');
  }
  if (wtimeout) {
    writeConcern.wtimeout = Number(wtimeout);
    searchParams.delete('wtimeout');
  }
  if (j) {
    writeConcern.j = j === 'true';
    searchParams.delete('j');
  }
  if (fsync) {
    writeConcern.fsync = fsync === 'true';
    searchParams.delete('fsync');
  }

  return Object.keys(writeConcern).length ? writeConcern : null;
};

const getMongoConnectionConfig = (uri: string): MongoConnectionConfig => {
  const encodedUri = encodeMongoCredentials(uri);
  const [baseUri, query = ''] = encodedUri.split('?');
  if (!query) {
    return { uri: encodedUri };
  }

  const searchParams = new URLSearchParams(query);
  const writeConcern = extractWriteConcern(searchParams);
  const normalizedQuery = searchParams.toString();

  return {
    uri: normalizedQuery ? `${baseUri}?${normalizedQuery}` : baseUri,
    ...(writeConcern ? { writeConcern } : {}),
  };
};

export const MongoModule = MongooseModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService, AppLogger],
  useFactory: (configService: ConfigService, logger: AppLogger) => {
    const driver = configService.getOrThrow<string>('mongo.driver');

    //  Local mode  skip MongoDB connection entirely
    if (driver === 'local') {
      logger.log('DB_DRIVER=local  skipping MongoDB connection');
      return {
        uri: 'mongodb://localhost:27017/local_dummy',
        retryAttempts: 0, // don't retry
        retryDelay: 0,
        connectionFactory: (connection: Connection) => {
          // Close immediately  we don't need it in local mode
          void connection.close();
          return connection;
        },
      };
    }

    //  Mongo mode
    const rawUri = configService.getOrThrow<string>('mongo.uri');

    if (!rawUri) {
      throw new Error('MONGO_URI is required when DB_DRIVER=mongo');
    }

    const { uri, writeConcern } = getMongoConnectionConfig(rawUri);
    logger.log('MongoDB connecting...');

    return {
      uri,
      ...(writeConcern ? { writeConcern } : {}),
      autoIndex: configService.get<boolean>('mongo.autoIndex', false),
      retryAttempts: configService.getOrThrow<number>('mongo.retryAttempts', 5),
      retryDelay: configService.getOrThrow<number>('mongo.retryDelay', 5000),
      maxPoolSize: configService.getOrThrow<number>('mongo.maxPoolSize', 50),
      minPoolSize: configService.getOrThrow<number>('mongo.minPoolSize', 0),
      serverSelectionTimeoutMS: configService.getOrThrow<number>(
        'mongo.serverSelectionTimeoutMs',
        10000,
      ),
      socketTimeoutMS: configService.getOrThrow<number>(
        'mongo.socketTimeoutMs',
        45000,
      ),
      maxIdleTimeMS: configService.getOrThrow<number>(
        'mongo.maxIdleTimeMs',
        30000,
      ),
      waitQueueTimeoutMS: configService.getOrThrow<number>(
        'mongo.waitQueueTimeoutMs',
        10000,
      ),
    };
  },
});
