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
import { ChatService } from '../services/chat.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { AppRequest } from 'src/common/interfaces/app-request.interface';
import { ApiResponse } from 'src/common/dto/api-response.dto';
import { CreateDirectRoomDto } from '../dto/create-direct-room.dto';
import { ListChatContactsDto } from '../dto/list-chat-contacts.dto';
import { ListConversationsDto } from '../dto/list-conversations.dto';
import { ListMessagesDto } from '../dto/list-messages.dto';
import { MarkRoomReadDto } from '../dto/mark-room-read.dto';
import { SendMessageBodyDto, SendMessageDto } from '../dto/send-message.dto';
import { UpdateRoomSettingsDto } from '../dto/update-room-settings.dto';
import { SuccessCode } from 'src/common/constants';
import { successResponse } from 'src/common/utils/response.util';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly service: ChatService) {}

  @Public()
  @Get('health')
  health() {
    return successResponse(this.service.health(), SuccessCode.SUCCESS);
  }

  @Get('conversations')
  async getConversations(
    @Req() req: AppRequest,
    @Query() query: ListConversationsDto,
  ): Promise<ApiResponse<unknown>> {
    const data = await this.service.getConversations(
      req.user?.sub ?? '',
      query,
    );
    return successResponse(
      data,
      SuccessCode.CHAT_FETCHED,
      'Conversations fetched successfully',
    );
  }

  @Get('contacts')
  async getContacts(
    @Req() req: AppRequest,
    @Query() query: ListChatContactsDto,
  ): Promise<ApiResponse<unknown>> {
    const data = await this.service.getContacts(req.user?.sub ?? '', query);
    return successResponse(
      data,
      SuccessCode.CHAT_FETCHED,
      'Contacts fetched successfully',
    );
  }

  @Post('rooms/direct')
  async createOrGetDirectRoom(
    @Req() req: AppRequest,
    @Body() dto: CreateDirectRoomDto,
  ): Promise<ApiResponse<unknown>> {
    const data = await this.service.createOrGetDirectRoom(
      req.user?.sub ?? '',
      dto,
    );
    return successResponse(data, SuccessCode.CHAT_CREATED, 'Direct room ready');
  }

  @Get('rooms/:roomId')
  async getConversationDetail(
    @Req() req: AppRequest,
    @Param('roomId') roomId: string,
  ): Promise<ApiResponse<unknown>> {
    const data = await this.service.getConversationDetail(
      req.user?.sub ?? '',
      roomId,
    );
    return successResponse(
      data,
      SuccessCode.CHAT_FETCHED,
      'Conversation fetched successfully',
    );
  }

  @Get('rooms/:roomId/messages')
  async getMessages(
    @Req() req: AppRequest,
    @Param('roomId') roomId: string,
    @Query() query: ListMessagesDto,
  ): Promise<ApiResponse<unknown>> {
    const data = await this.service.getMessages(
      req.user?.sub ?? '',
      roomId,
      query,
    );
    return successResponse(
      data,
      SuccessCode.CHAT_FETCHED,
      'Messages fetched successfully',
    );
  }

  @Post('rooms/:roomId/messages')
  async sendMessage(
    @Req() req: AppRequest,
    @Param('roomId') roomId: string,
    @Body() dto: SendMessageBodyDto,
  ): Promise<ApiResponse<unknown>> {
    const data = await this.service.sendMessage(req.user?.sub ?? '', {
      ...dto,
      roomId,
    } satisfies SendMessageDto);
    return successResponse(
      data,
      SuccessCode.CHAT_MESSAGE_SENT,
      'Message sent successfully',
    );
  }

  @Post('rooms/:roomId/read')
  async markRoomRead(
    @Req() req: AppRequest,
    @Param('roomId') roomId: string,
    @Body() dto: MarkRoomReadDto,
  ): Promise<ApiResponse<unknown>> {
    const data = await this.service.markRoomRead(
      req.user?.sub ?? '',
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
  async updateRoomSettings(
    @Req() req: AppRequest,
    @Param('roomId') roomId: string,
    @Body() dto: UpdateRoomSettingsDto,
  ): Promise<ApiResponse<unknown>> {
    const data = await this.service.updateRoomSettings(
      req.user?.sub ?? '',
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
