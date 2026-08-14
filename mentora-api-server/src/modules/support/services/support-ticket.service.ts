import { Injectable } from '@nestjs/common';
import { ErrorCode } from '@/common/constants';
import {
  throwBadRequest,
  throwNotFound,
} from '@/common/exceptions/throw-app-exception';
import { buildCsvExportFile, withStringId } from '@/common/utils/csv.util';
import { NotificationsService } from '@/modules/notifications/services/notifications.service';
import { CreateSupportTicketDto } from '../dto/create-support-ticket.dto';
import {
  AdminCreateSupportTicketDto,
  AdminListSupportTicketsDto,
  AdminReplySupportTicketDto,
  BulkUpdateSupportTicketStatusDto,
  UpdateSupportTicketStatusDto,
} from '../dto/admin-support-ticket.dto';
import { ListSupportTicketsDto } from '../dto/list-support-tickets.dto';
import { ReplySupportTicketDto } from '../dto/reply-support-ticket.dto';
import { SupportTicketRepository } from '../repositories/support-ticket.repository';

@Injectable()
export class SupportTicketService {
  constructor(
    private readonly repo: SupportTicketRepository,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createTicket(userId: string, dto: CreateSupportTicketDto) {
    const ticket = await this.repo.create({
      userId,
      subject: dto.subject.trim(),
      category: dto.category ?? 'other',
      priority: dto.priority ?? 'normal',
      message: dto.message.trim(),
    });

    void this.notificationsService.notify({
      userId,
      title: 'Support ticket created',
      message: `We received your ticket: ${ticket.subject}`,
      type: 'system',
      category: 'system',
      channels: ['in_app', 'push'],
      dedupeKey: `support-ticket-created:${String(ticket._id)}`,
      metadata: {
        ticketId: String(ticket._id),
        category: ticket.category,
        priority: ticket.priority,
      },
    });

    return ticket;
  }

  async listTickets(userId: string, query: ListSupportTicketsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { items, total } = await this.repo.listForUser(
      userId,
      page,
      limit,
      query.status,
    );

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    };
  }

  async getTicket(userId: string, ticketId: string) {
    const ticket = await this.repo.findForUser(ticketId, userId);
    if (!ticket) {
      return throwNotFound(ErrorCode.INVALID_REQUEST, {
        reason: 'support_ticket_not_found',
      });
    }

    return ticket;
  }

  async replyToTicket(
    userId: string,
    ticketId: string,
    dto: ReplySupportTicketDto,
  ) {
    const updated = await this.repo.addUserReply(
      ticketId,
      userId,
      dto.message.trim(),
    );

    if (!updated) {
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'support_ticket_not_found_or_closed',
      });
    }

    void this.notificationsService.notify({
      userId,
      title: 'Reply added',
      message: `Your reply was added to ${updated.subject}.`,
      type: 'system',
      category: 'system',
      channels: ['in_app'],
      dedupeKey: `support-ticket-reply:${ticketId}:${updated.messages.length}`,
      metadata: { ticketId },
    });

    return updated;
  }

  async closeTicket(userId: string, ticketId: string) {
    const updated = await this.repo.closeForUser(ticketId, userId);
    if (!updated) {
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'support_ticket_not_found_or_closed',
      });
    }

    return updated;
  }

  async listAllTickets(query: AdminListSupportTicketsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { items, total } = await this.repo.listAll(page, limit, {
      organizationId: query.organizationId,
      priority: query.priority,
      search: query.search,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      status: query.status,
    });

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    };
  }

  async exportTickets() {
    const { items } = await this.listAllTickets({
      page: 1,
      limit: 1000,
    });
    const headers = ['id', 'subject', 'category', 'priority', 'status'];
    return buildCsvExportFile(
      'support-tickets',
      headers,
      (items as Array<Record<string, unknown>>).map((item) =>
        withStringId(item),
      ),
    );
  }

  async createAdminTicket(userId: string, dto: AdminCreateSupportTicketDto) {
    const targetUserId = dto.userId ?? userId;
    const ticket = await this.repo.create({
      assignedTo: dto.assignedTo,
      branchId: dto.branchId,
      category: dto.category === 'billing' ? 'billing' : 'other',
      dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      message: (dto.message ?? dto.description ?? 'Created from CRM').trim(),
      organizationId: dto.organizationId,
      priority:
        dto.priority === 'urgent' || dto.priority === 'high'
          ? dto.priority
          : 'normal',
      subject: (dto.subject ?? dto.title ?? 'CRM support ticket').trim(),
      userId: targetUserId,
    });

    void this.notificationsService.notify({
      userId: targetUserId,
      title: 'Support ticket created',
      message: `We received your ticket: ${ticket.subject}`,
      type: 'system',
      category: 'system',
      channels: ['in_app'],
      dedupeKey: `support-ticket-admin-created:${String(ticket._id)}`,
      metadata: { ticketId: String(ticket._id), source: 'admin-crm' },
    });

    return ticket;
  }

  async replyAsAgent(
    agentId: string,
    ticketId: string,
    dto: AdminReplySupportTicketDto,
  ) {
    const updated = await this.repo.addAgentReply(
      ticketId,
      agentId,
      dto.message.trim(),
    );
    if (!updated) {
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'support_ticket_not_found_or_closed',
      });
    }

    void this.notificationsService.notify({
      userId: String(updated.userId),
      title: 'Support replied',
      message: `Support replied to ${updated.subject}.`,
      type: 'system',
      category: 'system',
      channels: ['in_app', 'push'],
      dedupeKey: `support-agent-reply:${ticketId}:${updated.messages.length}`,
      metadata: { ticketId },
    });

    return updated;
  }

  async updateTicketStatus(
    ticketId: string,
    dto: UpdateSupportTicketStatusDto,
  ) {
    const updated = await this.repo.updateStatus(ticketId, dto.status);
    if (!updated) {
      return throwNotFound(ErrorCode.INVALID_REQUEST, {
        reason: 'support_ticket_not_found',
      });
    }

    return updated;
  }

  async restoreTicket(ticketId: string) {
    return this.updateTicketStatus(ticketId, { status: 'open' });
  }

  async bulkUpdateTicketStatus(dto: BulkUpdateSupportTicketStatusDto) {
    const updated = await Promise.all(
      dto.recordIds.map((ticketId) =>
        this.repo.updateStatus(ticketId, dto.status),
      ),
    );
    return {
      matched: updated.filter(Boolean).length,
      modified: updated.filter(Boolean).length,
      status: dto.status,
    };
  }
}
