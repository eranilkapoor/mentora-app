import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { Permission } from '@/common/enums';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/modules/auth/guards/permissions.guard';
import { TenantContextGuard } from '@/modules/contexts/guards/tenant-context.guard';
import {
  CreateCrmDocumentDto,
  VerifyCrmDocumentDto,
} from '../dto/documents.dto';
import { DocumentsService } from '../services/documents.service';

@UseGuards(JwtAuthGuard, TenantContextGuard, PermissionsGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(Permission.CRM_DOCUMENT_MANAGE)
  async createDocument(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateCrmDocumentDto,
  ) {
    return successResponse(
      await this.service.createDocument(req.user.sub, dto),
      'CRM_DOCUMENT_CREATED',
      'CRM document created',
    );
  }

  @Get()
  @Permissions(Permission.CRM_DOCUMENT_VIEW)
  async listDocuments(
    @Query('tenantId') tenantId: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    return successResponse(
      await this.service.listDocuments(tenantId, entityType, entityId),
      'CRM_DOCUMENTS_FETCHED',
      'CRM documents fetched',
    );
  }

  @Post(':documentId/verify')
  @Permissions(Permission.CRM_DOCUMENT_MANAGE)
  async verifyDocument(
    @Req() req: AuthenticatedRequest,
    @Param('documentId') documentId: string,
    @Body() dto: VerifyCrmDocumentDto,
  ) {
    return successResponse(
      await this.service.verifyDocument(req.user.sub, documentId, dto),
      'CRM_DOCUMENT_VERIFIED',
      'CRM document verified',
    );
  }
}
