import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const MongooseConfig = MongooseModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const uri = configService.get<string>('mongo.uri');

    // 🔍 HARD DEBUG (temporary)
    console.log('MONGO URI FROM CONFIG:', uri);

    return {
      uri,
    };
  },
});
