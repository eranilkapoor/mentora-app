import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { SelectContextDto, UpsertUserMembershipDto } from '../dto/contexts.dto';
import { ContextsService } from '../services/contexts.service';

@UseGuards(JwtAuthGuard)
@Controller('admin')
export class ContextsController {
  constructor(private readonly service: ContextsService) {}

  @Get('me/contexts')
  async myContexts(@Req() req: AuthenticatedRequest) {
    return successResponse(
      await this.service.listUserContexts(req.user.sub),
      'EDUCATION_PLATFORM_CONTEXTS_FETCHED',
      'CRM contexts fetched',
    );
  }

  @Post('me/context')
  async selectContext(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SelectContextDto,
  ) {
    return successResponse(
      await this.service.selectContext(req.user.sub, dto),
      'EDUCATION_PLATFORM_CONTEXT_SELECTED',
      'CRM context selected',
    );
  }

  @Post('memberships')
  @HttpCode(HttpStatus.CREATED)
  async upsertMembership(@Body() dto: UpsertUserMembershipDto) {
    return successResponse(
      await this.service.upsertMembership(dto),
      'EDUCATION_PLATFORM_MEMBERSHIP_UPSERTED',
      'CRM membership upserted',
    );
  }
}
