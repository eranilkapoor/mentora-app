import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { Public } from '@/common/decorators/public.decorator';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { successResponse } from '@/common/utils/response.util';
import {
  ListSuccessStoriesDto,
  SubmitSuccessStoryDto,
} from '../dto/success-story.dto';
import { SuccessStoryService } from '../services/success-story.service';

@Controller('success-stories')
export class SuccessStoryController {
  constructor(private readonly service: SuccessStoryService) {}

  @Public()
  @Get()
  async listPublished(@Query() query: ListSuccessStoriesDto) {
    return successResponse(
      await this.service.listPublished(query),
      'SUCCESS_STORY.PUBLISHED_FETCHED',
      'Published success stories fetched',
    );
  }

  @Get('mine')
  async listMine(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListSuccessStoriesDto,
  ) {
    return successResponse(
      await this.service.listMine(req.user.sub, query),
      'SUCCESS_STORY.MINE_FETCHED',
      'Your success stories fetched',
    );
  }

  @Post()
  async submit(
    @Req() req: AuthenticatedRequest,
    @Body() dto: SubmitSuccessStoryDto,
  ) {
    return successResponse(
      await this.service.submit(req.user.sub, dto),
      'SUCCESS_STORY.SUBMITTED',
      'Success story submitted for review',
    );
  }
}
