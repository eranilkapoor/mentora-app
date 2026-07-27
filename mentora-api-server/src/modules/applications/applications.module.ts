import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContextsModule } from '../contexts/contexts.module';
import { ApplicationsController } from './controllers/applications.controller';
import { Application, ApplicationSchema } from './schemas/applications.schema';
import { ApplicationsService } from './services/applications.service';

@Module({
  imports: [
    ContextsModule,
    MongooseModule.forFeature([
      { name: Application.name, schema: ApplicationSchema },
    ]),
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
