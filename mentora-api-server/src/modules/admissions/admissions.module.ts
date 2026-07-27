import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from '../admin/admin.module';
import { ContextsModule } from '../contexts/contexts.module';
import { AdmissionsController } from './controllers/admissions.controller';
import { Admission, AdmissionSchema } from './schemas/admissions.schema';
import { AdmissionsService } from './services/admissions.service';

@Module({
  imports: [
    AdminModule,
    ContextsModule,
    MongooseModule.forFeature([
      { name: Admission.name, schema: AdmissionSchema },
    ]),
  ],
  controllers: [AdmissionsController],
  providers: [AdmissionsService],
  exports: [AdmissionsService],
})
export class AdmissionsModule {}
