import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from '../admin/admin.module';
import { ContextsModule } from '../contexts/contexts.module';
import { CountriesController } from './controllers/countries.controller';
import {
  CountryGuide,
  CountryGuideSchema,
} from './schemas/country-guide.schema';
import { CountriesService } from './services/countries.service';

@Module({
  imports: [
    AdminModule,
    ContextsModule,
    MongooseModule.forFeature([
      { name: CountryGuide.name, schema: CountryGuideSchema },
    ]),
  ],
  controllers: [CountriesController],
  providers: [CountriesService],
  exports: [CountriesService],
})
export class CountriesModule {}
