import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';
import { ContextsModule } from '../contexts/contexts.module';
import {
  AcademicSessionsController,
  AdminStudentsController,
  CoursesController,
  EnrollmentController,
  FeesController,
  SpecializationsController,
} from './controllers/education-records.controller';
import { EducationRecordsService } from './services/education-records.service';

@Module({
  imports: [AdminModule, ContextsModule],
  controllers: [
    AdminStudentsController,
    AcademicSessionsController,
    CoursesController,
    SpecializationsController,
    EnrollmentController,
    FeesController,
  ],
  providers: [EducationRecordsService],
  exports: [EducationRecordsService],
})
export class EducationRecordsModule {}
