import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from '../admin/admin.module';
import { ContextsModule } from '../contexts/contexts.module';
import { IntegrationsController } from './controllers/integrations.controller';
import {
  IntegrationProviderConfig,
  IntegrationProviderConfigSchema,
} from './schemas/integrations.schema';
import { IntegrationsService } from './services/integrations.service';

@Module({
  imports: [
    AdminModule,
    ContextsModule,
    MongooseModule.forFeature([
      {
        name: IntegrationProviderConfig.name,
        schema: IntegrationProviderConfigSchema,
      },
    ]),
  ],
  controllers: [IntegrationsController],
  providers: [IntegrationsService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
