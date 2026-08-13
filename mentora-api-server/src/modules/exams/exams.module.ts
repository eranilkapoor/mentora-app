import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RbacModule } from '@/common/rbac/rbac.module';
import { ContextsModule } from '../contexts/contexts.module';
import { ExamsController } from './controllers/exams.controller';
import { Exam, ExamSchema } from './schemas/exam.schema';
import { ExamsService } from './services/exams.service';

@Module({
  imports: [
    ContextsModule,
    RbacModule,
    MongooseModule.forFeature([{ name: Exam.name, schema: ExamSchema }]),
  ],
  controllers: [ExamsController],
  providers: [ExamsService],
  exports: [ExamsService],
})
export class ExamsModule {}
