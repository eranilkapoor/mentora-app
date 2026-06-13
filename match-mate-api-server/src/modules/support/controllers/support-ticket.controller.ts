import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SuccessCode } from '@/common/constants';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CreateSupportTicketDto } from '../dto/create-support-ticket.dto';
import { ListSupportTicketsDto } from '../dto/list-support-tickets.dto';
import { ReplySupportTicketDto } from '../dto/reply-support-ticket.dto';
import { SupportTicketService } from '../services/support-ticket.service';

@Controller('support/tickets')
@UseGuards(JwtAuthGuard)
export class SupportTicketController {
  constructor(private readonly service: SupportTicketService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTicket(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateSupportTicketDto,
  ) {
    return successResponse(
      await this.service.createTicket(req.user.sub, dto),
      SuccessCode.SUPPORT_TICKET_CREATED,
      'Support ticket created',
    );
  }

  @Get()
  async listTickets(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListSupportTicketsDto,
  ) {
    return successResponse(
      await this.service.listTickets(req.user.sub, query),
      SuccessCode.SUPPORT_TICKETS_FETCHED,
      'Support tickets fetched',
    );
  }

  @Get(':ticketId')
  async getTicket(
    @Req() req: AuthenticatedRequest,
    @Param('ticketId') ticketId: string,
  ) {
    return successResponse(
      await this.service.getTicket(req.user.sub, ticketId),
      SuccessCode.SUPPORT_TICKET_FETCHED,
      'Support ticket fetched',
    );
  }

  @Post(':ticketId/replies')
  @HttpCode(HttpStatus.OK)
  async replyToTicket(
    @Req() req: AuthenticatedRequest,
    @Param('ticketId') ticketId: string,
    @Body() dto: ReplySupportTicketDto,
  ) {
    return successResponse(
      await this.service.replyToTicket(req.user.sub, ticketId, dto),
      SuccessCode.SUPPORT_TICKET_REPLIED,
      'Support ticket reply added',
    );
  }

  @Patch(':ticketId/close')
  async closeTicket(
    @Req() req: AuthenticatedRequest,
    @Param('ticketId') ticketId: string,
  ) {
    return successResponse(
      await this.service.closeTicket(req.user.sub, ticketId),
      SuccessCode.SUPPORT_TICKET_CLOSED,
      'Support ticket closed',
    );
  }
}
