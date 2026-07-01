import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import {
  AdminListSuccessStoriesDto,
  ReviewSuccessStoryDto,
} from '../dto/success-story.dto';
import { SuccessStoryService } from '../services/success-story.service';

@Controller('admin/success-stories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.CONTENT_MODERATOR)
export class AdminSuccessStoryController {
  constructor(private readonly service: SuccessStoryService) {}

  @Get()
  async list(@Query() query: AdminListSuccessStoriesDto) {
    return successResponse(
      await this.service.listForReview(query),
      'SUCCESS_STORY.REVIEW_QUEUE_FETCHED',
      'Success story review queue fetched',
    );
  }

  @Patch(':storyId/review')
  async review(
    @Req() req: AuthenticatedRequest,
    @Param('storyId') storyId: string,
    @Body() dto: ReviewSuccessStoryDto,
  ) {
    return successResponse(
      await this.service.review(req.user.sub, storyId, dto),
      'SUCCESS_STORY.REVIEWED',
      'Success story review completed',
    );
  }
}
