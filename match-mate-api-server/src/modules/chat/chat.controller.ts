import { Controller, Get, Param } from '@nestjs/common';

@Controller('chat')
export class ChatController {
  @Get('health')
  health() {
    return { status: 'Chat service running' };
  }
}