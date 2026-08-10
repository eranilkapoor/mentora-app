import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentsController } from './controllers/documents.controller';
import {
  DocumentRecord,
  DocumentRecordSchema,
} from './schemas/documents.schema';
import { DocumentsService } from './services/documents.service';
import { ContextsModule } from '../contexts/contexts.module';

@Module({
  imports: [
    ContextsModule,
    MongooseModule.forFeature([
      { name: DocumentRecord.name, schema: DocumentRecordSchema },
    ]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
