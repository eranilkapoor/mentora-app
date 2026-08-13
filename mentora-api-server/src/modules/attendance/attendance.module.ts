import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RbacModule } from '@/common/rbac/rbac.module';
import { ContextsModule } from '../contexts/contexts.module';
import { StudentAttendanceController } from './controllers/student-attendance.controller';
import { StaffAttendanceController } from './controllers/staff-attendance.controller';
import {
  StudentAttendance,
  StudentAttendanceSchema,
} from './schemas/student-attendance.schema';
import {
  StaffAttendance,
  StaffAttendanceSchema,
} from './schemas/staff-attendance.schema';
import { StudentAttendanceService } from './services/student-attendance.service';
import { StaffAttendanceService } from './services/staff-attendance.service';

@Module({
  imports: [
    ContextsModule,
    RbacModule,
    MongooseModule.forFeature([
      { name: StudentAttendance.name, schema: StudentAttendanceSchema },
      { name: StaffAttendance.name, schema: StaffAttendanceSchema },
    ]),
  ],
  controllers: [StudentAttendanceController, StaffAttendanceController],
  providers: [StudentAttendanceService, StaffAttendanceService],
  exports: [StudentAttendanceService, StaffAttendanceService],
})
export class AttendanceModule {}
