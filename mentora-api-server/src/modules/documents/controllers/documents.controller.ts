import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
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
import { OrganizationContextGuard } from '@/modules/contexts/guards/organization-context.guard';
import {
  CreateCrmDocumentDto,
  UpdateCrmDocumentDto,
  VerifyCrmDocumentDto,
} from '../dto/documents.dto';
import { DocumentsService } from '../services/documents.service';

@UseGuards(JwtAuthGuard, OrganizationContextGuard, PermissionsGuard)
@Controller('admin/documents')
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
    @Query('organizationId') organizationId: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return successResponse(
      await this.service.listDocuments({
        category,
        entityId,
        entityType,
        limit,
        page,
        search,
        sortBy,
        sortOrder,
        status,
        organizationId,
      }),
      'CRM_DOCUMENTS_FETCHED',
      'CRM documents fetched',
    );
  }

  @Put(':documentId')
  @Permissions(Permission.CRM_DOCUMENT_MANAGE)
  async updateDocument(
    @Param('documentId') documentId: string,
    @Body() dto: UpdateCrmDocumentDto,
  ) {
    return successResponse(
      await this.service.updateDocument(documentId, dto),
      'CRM_DOCUMENT_UPDATED',
      'CRM document updated',
    );
  }

  @Delete(':documentId')
  @Permissions(Permission.CRM_DOCUMENT_MANAGE)
  async archiveDocument(
    @Param('documentId') documentId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return successResponse(
      await this.service.archiveDocument(documentId, organizationId),
      'CRM_DOCUMENT_ARCHIVED',
      'CRM document archived',
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
