import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RbacModule } from '@/common/rbac/rbac.module';
import { ContextsModule } from '../contexts/contexts.module';
import { TimetableController } from './controllers/timetable.controller';
import { Timetable, TimetableSchema } from './schemas/timetable.schema';
import { TimetableService } from './services/timetable.service';

@Module({
  imports: [
    ContextsModule,
    RbacModule,
    MongooseModule.forFeature([
      { name: Timetable.name, schema: TimetableSchema },
    ]),
  ],
  controllers: [TimetableController],
  providers: [TimetableService],
  exports: [TimetableService],
})
export class TimetableModule {}
