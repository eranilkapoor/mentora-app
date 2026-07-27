import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from '../admin/admin.module';
import { ContextsModule } from '../contexts/contexts.module';
import { ReportsController } from './controllers/reports.controller';
import {
  ReportDefinition,
  ReportDefinitionSchema,
  ReportExportJob,
  ReportExportJobSchema,
} from './schemas/reports.schema';
import { ReportsService } from './services/reports.service';

@Module({
  imports: [
    AdminModule,
    ContextsModule,
    MongooseModule.forFeature([
      { name: ReportDefinition.name, schema: ReportDefinitionSchema },
      { name: ReportExportJob.name, schema: ReportExportJobSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
