import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from '../admin/admin.module';
import { ContextsModule } from '../contexts/contexts.module';
import { UniversityPartnersController } from './controllers/university-partners.controller';
import {
  UniversityPartner,
  UniversityPartnerSchema,
} from './schemas/university-partner.schema';
import { UniversityPartnersService } from './services/university-partners.service';

@Module({
  imports: [
    AdminModule,
    ContextsModule,
    MongooseModule.forFeature([
      { name: UniversityPartner.name, schema: UniversityPartnerSchema },
    ]),
  ],
  controllers: [UniversityPartnersController],
  providers: [UniversityPartnersService],
  exports: [UniversityPartnersService],
})
export class UniversityPartnersModule {}
