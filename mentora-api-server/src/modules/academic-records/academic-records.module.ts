import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RbacModule } from '@/common/rbac/rbac.module';
import { ContextsModule } from '../contexts/contexts.module';
import { LearningModule } from '../learning/learning.module';
import { ExamsModule } from '../exams/exams.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { ReportCardsController } from './controllers/report-cards.controller';
import { TranscriptsController } from './controllers/transcripts.controller';
import { ReportCard, ReportCardSchema } from './schemas/report-card.schema';
import { Transcript, TranscriptSchema } from './schemas/transcript.schema';
import { ReportCardsService } from './services/report-cards.service';
import { TranscriptsService } from './services/transcripts.service';

@Module({
  imports: [
    ContextsModule,
    RbacModule,
    LearningModule,
    ExamsModule,
    AttendanceModule,
    MongooseModule.forFeature([
      { name: ReportCard.name, schema: ReportCardSchema },
      { name: Transcript.name, schema: TranscriptSchema },
    ]),
  ],
  controllers: [ReportCardsController, TranscriptsController],
  providers: [ReportCardsService, TranscriptsService],
  exports: [ReportCardsService, TranscriptsService],
})
export class AcademicRecordsModule {}
