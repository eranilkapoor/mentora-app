import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from '../admin/admin.module';
import { ContextsModule } from '../contexts/contexts.module';
import { ServiceCatalogController } from './controllers/service-catalog.controller';
import {
  ServiceCatalogItem,
  ServiceCatalogItemSchema,
} from './schemas/service-catalog-item.schema';
import { ServiceCatalogService } from './services/service-catalog.service';

@Module({
  imports: [
    AdminModule,
    ContextsModule,
    MongooseModule.forFeature([
      { name: ServiceCatalogItem.name, schema: ServiceCatalogItemSchema },
    ]),
  ],
  controllers: [ServiceCatalogController],
  providers: [ServiceCatalogService],
  exports: [ServiceCatalogService],
})
export class ServiceCatalogModule {}
