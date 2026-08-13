import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from '../admin/admin.module';
import { ContextsModule } from '../contexts/contexts.module';
import { StudyMaterialsController } from './controllers/study-materials.controller';
import {
  StudyMaterial,
  StudyMaterialSchema,
} from './schemas/study-material.schema';
import { StudyMaterialsService } from './services/study-materials.service';

@Module({
  imports: [
    AdminModule,
    ContextsModule,
    MongooseModule.forFeature([
      { name: StudyMaterial.name, schema: StudyMaterialSchema },
    ]),
  ],
  controllers: [StudyMaterialsController],
  providers: [StudyMaterialsService],
  exports: [StudyMaterialsService],
})
export class StudyMaterialsModule {}
