import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Role } from '@/common/enums';
import { SuccessCode } from '@/common/constants';
import { successResponse } from '@/common/utils/response.util';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { MediaService } from '@/modules/profiles/services/media.service';
import { ReviewMediaDto } from '@/modules/profiles/dto/media-review.dto';
import { KycService } from '@/modules/safety/services/kyc.service';
import { ReviewKycDto } from '@/modules/safety/dto/kyc.dto';
import { VerificationStatus } from '@/modules/safety/schemas/verification.schema';
import { AdminService } from '../services/admin.service';
import { AdminAuditService } from '../services/admin-audit.service';
import { ChatService } from '@/modules/chat/services/chat.service';
import { ChatModerationStatus } from '@/modules/chat/enums/chat.enums';
import { ReviewChatMessageDto } from '@/modules/chat/dto/review-chat-message.dto';

const MODERATION_ROLES = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.MODERATOR,
  Role.CONTENT_MODERATOR,
  Role.KYC_REVIEWER,
];

@Controller('admin/moderation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(...MODERATION_ROLES)
export class AdminModerationController {
  constructor(
    private readonly adminService: AdminService,
    private readonly mediaService: MediaService,
    private readonly kycService: KycService,
    private readonly chatService: ChatService,
    private readonly auditService: AdminAuditService,
  ) {}

  @Get('queue')
  async getUnifiedQueue() {
    return successResponse(
      await this.adminService.getModerationQueue(),
      SuccessCode.ADMIN_MODERATION_QUEUE_FETCHED,
    );
  }

  @Get('media')
  async getMediaQueue(@Query('limit') limit?: string) {
    return successResponse(
      await this.mediaService.getReviewQueue(limit ? Number(limit) : undefined),
      SuccessCode.ADMIN_MODERATION_QUEUE_FETCHED,
    );
  }

  @Patch('media/:mediaId/review')
  async reviewMedia(
    @Req() req: AuthenticatedRequest,
    @Param('mediaId') mediaId: string,
    @Body() dto: ReviewMediaDto,
  ) {
    const data = await this.mediaService.reviewMedia(
      req.user.sub,
      mediaId,
      dto.approve,
      dto.note,
    );
    await this.auditService.write({
      req,
      actorId: req.user.sub,
      action: dto.approve ? 'media.approved' : 'media.rejected',
      resource: 'media',
      targetId: mediaId,
      reason: dto.note,
      after: data ? (data as unknown as Record<string, unknown>) : undefined,
    });
    return successResponse(data, SuccessCode.ADMIN_USER_UPDATED);
  }

  @Get('chat')
  async getChatModerationQueue(
    @Query('status')
    status: ChatModerationStatus = ChatModerationStatus.FLAGGED,
    @Query('limit') limit?: string,
  ) {
    return successResponse(
      await this.chatService.getModerationQueue(
        status,
        limit ? Number(limit) : undefined,
      ),
      SuccessCode.ADMIN_MODERATION_QUEUE_FETCHED,
    );
  }

  @Patch('chat/:messageId/review')
  async reviewChatMessage(
    @Req() req: AuthenticatedRequest,
    @Param('messageId') messageId: string,
    @Body() dto: ReviewChatMessageDto,
  ) {
    const data = await this.chatService.reviewMessage(
      req.user.sub,
      messageId,
      dto.approve,
      dto.note,
    );
    await this.auditService.write({
      req,
      actorId: req.user.sub,
      action: dto.approve ? 'chat_message.approved' : 'chat_message.rejected',
      resource: 'chat_message',
      targetId: messageId,
      reason: dto.note,
      after: data ? (data as unknown as Record<string, unknown>) : undefined,
    });
    return successResponse(data, SuccessCode.ADMIN_USER_UPDATED);
  }

  @Get('kyc')
  async getKycQueue(
    @Query('status') status: VerificationStatus = VerificationStatus.PENDING,
  ) {
    return successResponse(
      await this.kycService.getReviewQueue(status),
      SuccessCode.ADMIN_MODERATION_QUEUE_FETCHED,
    );
  }

  @Post('kyc/:userId/review')
  async reviewKyc(
    @Req() req: AuthenticatedRequest,
    @Param('userId') userId: string,
    @Body() dto: ReviewKycDto,
  ) {
    const data = await this.kycService.review(userId, req.user.sub, dto);
    await this.auditService.write({
      req,
      actorId: req.user.sub,
      action: `kyc.${dto.status}`,
      resource: 'verification',
      targetId: userId,
      reason: dto.rejectionReason,
      after: data ? (data as unknown as Record<string, unknown>) : undefined,
    });
    return successResponse(data, SuccessCode.ADMIN_PROFILE_APPROVED);
  }
}
