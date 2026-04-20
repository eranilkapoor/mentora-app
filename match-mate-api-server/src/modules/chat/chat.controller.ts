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
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { AppRequest } from 'src/common/interfaces/app-request.interface';
import { ApiResponse } from 'src/common/dto/response.dto';
import { CreateDirectRoomDto } from './dto/create-direct-room.dto';
import { ListChatContactsDto } from './dto/list-chat-contacts.dto';
import { ListConversationsDto } from './dto/list-conversations.dto';
import { ListMessagesDto } from './dto/list-messages.dto';
import { MarkRoomReadDto } from './dto/mark-room-read.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateRoomSettingsDto } from './dto/update-room-settings.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly service: ChatService) {}

  @Public()
  @Get('health')
  health() {
    return this.service.health();
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
    return new ApiResponse(true, 'Conversations fetched successfully', data);
  }

  @Get('contacts')
  async getContacts(
    @Req() req: AppRequest,
    @Query() query: ListChatContactsDto,
  ): Promise<ApiResponse<unknown>> {
    const data = await this.service.getContacts(req.user?.sub ?? '', query);
    return new ApiResponse(true, 'Contacts fetched successfully', data);
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
    return new ApiResponse(true, 'Direct room ready', data);
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
    return new ApiResponse(true, 'Conversation fetched successfully', data);
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
    return new ApiResponse(true, 'Messages fetched successfully', data);
  }

  @Post('rooms/:roomId/messages')
  async sendMessage(
    @Req() req: AppRequest,
    @Param('roomId') roomId: string,
    @Body() dto: SendMessageDto,
  ): Promise<ApiResponse<unknown>> {
    const data = await this.service.sendMessage(req.user?.sub ?? '', {
      ...dto,
      roomId,
    });
    return new ApiResponse(true, 'Message sent successfully', data);
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
    return new ApiResponse(true, 'Room marked as read', data);
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
    return new ApiResponse(true, 'Room settings updated', data);
  }
}
