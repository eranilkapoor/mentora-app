import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentsController } from './controllers/documents.controller';
import { CrmDocument, CrmDocumentSchema } from './schemas/documents.schema';
import { DocumentsService } from './services/documents.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CrmDocument.name, schema: CrmDocumentSchema },
    ]),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
