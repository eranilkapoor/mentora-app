import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '@/common/decorators/roles.decorator';
import { SuccessCode } from '@/common/constants';
import { Role } from '@/common/enums';
import { AuthenticatedRequest } from '@/common/interfaces/authenticated-request.interface';
import { successResponse } from '@/common/utils/response.util';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import {
  AdminCreateSupportTicketDto,
  AdminListSupportTicketsDto,
  AdminReplySupportTicketDto,
  UpdateSupportTicketStatusDto,
} from '../dto/admin-support-ticket.dto';
import { SupportTicketService } from '../services/support-ticket.service';

@Controller('admin/support/tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SUPPORT)
export class AdminSupportTicketController {
  constructor(private readonly service: SupportTicketService) {}

  @Get()
  async listTickets(@Query() query: AdminListSupportTicketsDto) {
    return successResponse(
      await this.service.listAllTickets(query),
      SuccessCode.SUPPORT_TICKETS_FETCHED,
      'Support tickets fetched',
    );
  }

  @Post()
  async createTicket(
    @Req() req: AuthenticatedRequest,
    @Body() dto: AdminCreateSupportTicketDto,
  ) {
    return successResponse(
      await this.service.createAdminTicket(req.user.sub, dto),
      SuccessCode.SUPPORT_TICKET_CREATED,
      'Support ticket created',
    );
  }

  @Post(':ticketId/replies')
  async replyAsAgent(
    @Req() req: AuthenticatedRequest,
    @Param('ticketId') ticketId: string,
    @Body() dto: AdminReplySupportTicketDto,
  ) {
    return successResponse(
      await this.service.replyAsAgent(req.user.sub, ticketId, dto),
      SuccessCode.SUPPORT_TICKET_REPLIED,
      'Support ticket reply added',
    );
  }

  @Patch(':ticketId/status')
  async updateStatus(
    @Param('ticketId') ticketId: string,
    @Body() dto: UpdateSupportTicketStatusDto,
  ) {
    return successResponse(
      await this.service.updateTicketStatus(ticketId, dto),
      SuccessCode.SUPPORT_TICKET_UPDATED,
      'Support ticket status updated',
    );
  }

  @Delete(':ticketId')
  async closeTicket(@Param('ticketId') ticketId: string) {
    return successResponse(
      await this.service.updateTicketStatus(ticketId, { status: 'closed' }),
      SuccessCode.SUPPORT_TICKET_UPDATED,
      'Support ticket closed',
    );
  }
}
