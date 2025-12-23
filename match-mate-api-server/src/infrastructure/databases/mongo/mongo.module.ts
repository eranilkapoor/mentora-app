import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const MongoModule = MongooseModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
        return {
            uri: configService.get<string>('mongo.uri'),
            retryAttempts: configService.get<number>('mongo.retryAttempts', 5),
            retryDelay: configService.get<number>('mongo.retryDelay', 5000),
        };
    },
});
