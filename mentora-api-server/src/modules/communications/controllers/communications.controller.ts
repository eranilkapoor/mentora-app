import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CreateCommunicationDto } from '../dto/communications.dto';
import { CommunicationsService } from '../services/communications.service';

@UseGuards(JwtAuthGuard)
@Controller('communications')
export class CommunicationsController {
  constructor(private readonly service: CommunicationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCommunication(@Body() dto: CreateCommunicationDto) {
    return successResponse(
      await this.service.createCommunication(dto),
      'EDUCATION_PLATFORM_COMMUNICATION_CREATED',
      'CRM communication created',
    );
  }

  @Get()
  async listCommunications(@Query('tenantId') tenantId: string) {
    return successResponse(
      await this.service.listCommunications(tenantId),
      'EDUCATION_PLATFORM_COMMUNICATIONS_FETCHED',
      'CRM communications fetched',
    );
  }
}
