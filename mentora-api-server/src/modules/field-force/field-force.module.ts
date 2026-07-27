import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from '../admin/admin.module';
import { ContextsModule } from '../contexts/contexts.module';
import { FieldForceController } from './controllers/field-force.controller';
import { FieldVisit, FieldVisitSchema } from './schemas/field-force.schema';
import { FieldForceService } from './services/field-force.service';

@Module({
  imports: [
    AdminModule,
    ContextsModule,
    MongooseModule.forFeature([
      { name: FieldVisit.name, schema: FieldVisitSchema },
    ]),
  ],
  controllers: [FieldForceController],
  providers: [FieldForceService],
  exports: [FieldForceService],
})
export class FieldForceModule {}
