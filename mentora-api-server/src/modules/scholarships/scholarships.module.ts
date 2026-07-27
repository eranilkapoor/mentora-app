import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from '../admin/admin.module';
import { ContextsModule } from '../contexts/contexts.module';
import { ScholarshipsController } from './controllers/scholarships.controller';
import {
  ScholarshipApplication,
  ScholarshipApplicationSchema,
} from './schemas/scholarships.schema';
import { ScholarshipsService } from './services/scholarships.service';

@Module({
  imports: [
    AdminModule,
    ContextsModule,
    MongooseModule.forFeature([
      {
        name: ScholarshipApplication.name,
        schema: ScholarshipApplicationSchema,
      },
    ]),
  ],
  controllers: [ScholarshipsController],
  providers: [ScholarshipsService],
  exports: [ScholarshipsService],
})
export class ScholarshipsModule {}
