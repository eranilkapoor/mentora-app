import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
// @UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Get()
  getMyNotifications(@Req() req: any) {
    return this.service.getUserNotifications(req.user.id);
  }

  @Post()
  create(@Body() dto: CreateNotificationDto) {
    return this.service.notify(dto);
  }

  @Post(':id/read')
  markRead(@Param('id') id: string) {
    return this.service.markRead(id);
  }

  @Post('read-all')
  markAllRead(@Req() req: any) {
    return this.service.markAllRead(req.user.id);
  }
}