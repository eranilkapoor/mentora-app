import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Patch,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ChatService } from '../services/chat.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Public } from '@/common/decorators/public.decorator';
import { AppRequest } from '@/common/interfaces/app-request.interface';
import { ApiResponse } from '@/common/dto/api-response.dto';
import { CreateDirectRoomDto } from '../dto/create-direct-room.dto';
import { ListChatContactsDto } from '../dto/list-chat-contacts.dto';
import { ListConversationsDto } from '../dto/list-conversations.dto';
import { ListMessagesDto } from '../dto/list-messages.dto';
import { MarkRoomReadDto } from '../dto/mark-room-read.dto';
import { SendMessageBodyDto, SendMessageDto } from '../dto/send-message.dto';
import { UpdateRoomSettingsDto } from '../dto/update-room-settings.dto';
import { RespondChatRequestDto } from '../dto/respond-chat-request.dto';
import { SuccessCode } from '@/common/constants';
import { successResponse } from '@/common/utils/response.util';
import { FeatureKey } from '@/common/enums';
import { FeatureRequired } from '@/modules/subscriptions/decorators/feature.decorator';
import { FeatureGuard } from '@/modules/subscriptions/guards/feature.guard';

@Controller('chats')
@UseGuards(JwtAuthGuard, FeatureGuard)
export class ChatController {
  constructor(private readonly service: ChatService) {}

  private getUserId(req: AppRequest): string {
    return req.user?.sub ?? '';
  }

  @Public()
  @Get('health')
  health() {
    return successResponse(this.service.health(), SuccessCode.SUCCESS);
  }

  @Get('conversations')
  @FeatureRequired(FeatureKey.CHAT_ACCESS)
  async getConversations(
    @Req() req: AppRequest,
    @Query() query: ListConversationsDto,
  ): Promise<ApiResponse<unknown>> {
    const data = await this.service.getConversations(
      this.getUserId(req),
      query,
    );
    return successResponse(
      data,
      SuccessCode.CHAT_FETCHED,
      'Conversations fetched successfully',
    );
  }

  @Get('contacts')
  @FeatureRequired(FeatureKey.CHAT_ACCESS)
  async getContacts(
    @Req() req: AppRequest,
    @Query() query: ListChatContactsDto,
  ): Promise<ApiResponse<unknown>> {
    const data = await this.service.getContacts(this.getUserId(req), query);
    return successResponse(
      data,
      SuccessCode.CHAT_FETCHED,
      'Contacts fetched successfully',
    );
  }

  @Post('rooms/direct')
  @FeatureRequired(FeatureKey.CHAT_ACCESS)
  async createOrGetDirectRoom(
    @Req() req: AppRequest,
    @Body() dto: CreateDirectRoomDto,
  ): Promise<ApiResponse<unknown>> {
    const data = await this.service.createOrGetDirectRoom(
      this.getUserId(req),
      dto,
    );
    return successResponse(data, SuccessCode.CHAT_CREATED, 'Direct room ready');
  }

  @Get('rooms/:roomId')
  @FeatureRequired(FeatureKey.CHAT_ACCESS)
  async getConversationDetail(
    @Req() req: AppRequest,
    @Param('roomId') roomId: string,
  ): Promise<ApiResponse<unknown>> {
    const data = await this.service.getConversationDetail(
      this.getUserId(req),
      roomId,
    );
    return successResponse(
      data,
      SuccessCode.CHAT_FETCHED,
      'Conversation fetched successfully',
    );
  }

  @Get('rooms/:roomId/messages')
  @FeatureRequired(FeatureKey.CHAT_ACCESS)
  async getMessages(
    @Req() req: AppRequest,
    @Param('roomId') roomId: string,
    @Query() query: ListMessagesDto,
  ): Promise<ApiResponse<unknown>> {
    const data = await this.service.getMessages(
      this.getUserId(req),
      roomId,
      query,
    );
    return successResponse(
      data,
      SuccessCode.CHAT_FETCHED,
      'Messages fetched successfully',
    );
  }

  @Post('rooms/:roomId/request/respond')
  @FeatureRequired(FeatureKey.CHAT_ACCESS)
  async respondToChatRequest(
    @Req() req: AppRequest,
    @Param('roomId') roomId: string,
    @Body() dto: RespondChatRequestDto,
  ): Promise<ApiResponse<unknown>> {
    const data = await this.service.respondToChatRequest(
      this.getUserId(req),
      roomId,
      dto.action,
    );
    return successResponse(
      data,
      SuccessCode.CHAT_FETCHED,
      'Chat request updated',
    );
  }

  @Post('rooms/:roomId/messages')
  @FeatureRequired(FeatureKey.MESSAGE_LIMIT)
  async sendMessage(
    @Req() req: AppRequest,
    @Param('roomId') roomId: string,
    @Body() dto: SendMessageBodyDto,
  ): Promise<ApiResponse<unknown>> {
    const data = await this.service.sendMessage(this.getUserId(req), {
      ...dto,
      roomId,
    } satisfies SendMessageDto);
    return successResponse(
      data,
      SuccessCode.CHAT_MESSAGE_SENT,
      'Message sent successfully',
    );
  }

  @Post('attachments')
  @FeatureRequired(FeatureKey.SEND_IMAGES_IN_CHAT)
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      limits: { fileSize: 10 * 1024 * 1024, files: 5, fields: 5 },
    }),
  )
  @HttpCode(HttpStatus.CREATED)
  async uploadAttachments(
    @Req() req: AppRequest,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<ApiResponse<unknown>> {
    const data = await this.service.uploadAttachments(
      this.getUserId(req),
      files ?? [],
    );
    return successResponse(
      data,
      SuccessCode.FILE_UPLOADED,
      'Chat attachments uploaded',
    );
  }

  @Delete('rooms/:roomId/messages/:messageId')
  @FeatureRequired(FeatureKey.CHAT_ACCESS)
  async deleteMessage(
    @Req() req: AppRequest,
    @Param('roomId') roomId: string,
    @Param('messageId') messageId: string,
  ): Promise<ApiResponse<unknown>> {
    const data = await this.service.deleteOwnMessage(
      this.getUserId(req),
      roomId,
      messageId,
    );
    return successResponse(
      data,
      SuccessCode.CHAT_MESSAGE_DELETED,
      'Message deleted successfully',
    );
  }

  @Post('rooms/:roomId/read')
  @FeatureRequired(FeatureKey.CHAT_ACCESS)
  async markRoomRead(
    @Req() req: AppRequest,
    @Param('roomId') roomId: string,
    @Body() dto: MarkRoomReadDto,
  ): Promise<ApiResponse<unknown>> {
    const data = await this.service.markRoomRead(
      this.getUserId(req),
      roomId,
      dto,
    );
    return successResponse(
      data,
      SuccessCode.CHAT_MESSAGE_READ,
      'Room marked as read',
    );
  }

  @Patch('rooms/:roomId/settings')
  @FeatureRequired(FeatureKey.CHAT_ACCESS)
  async updateRoomSettings(
    @Req() req: AppRequest,
    @Param('roomId') roomId: string,
    @Body() dto: UpdateRoomSettingsDto,
  ): Promise<ApiResponse<unknown>> {
    const data = await this.service.updateRoomSettings(
      this.getUserId(req),
      roomId,
      dto,
    );
    return successResponse(
      data,
      SuccessCode.CHAT_FETCHED,
      'Room settings updated',
    );
  }
}
