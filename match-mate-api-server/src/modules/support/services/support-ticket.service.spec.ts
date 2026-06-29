import { AppException } from '@/common/exceptions/app.exception';
import type { NotificationsService } from '@/modules/notifications/services/notifications.service';
import type { SupportTicketRepository } from '../repositories/support-ticket.repository';
import { SupportTicketService } from './support-ticket.service';

describe('SupportTicketService', () => {
  const repo = {
    create: jest.fn(),
    listForUser: jest.fn(),
    findForUser: jest.fn(),
    addUserReply: jest.fn(),
    closeForUser: jest.fn(),
    listAll: jest.fn(),
    addAgentReply: jest.fn(),
    updateStatus: jest.fn(),
  };
  const notifications = { notify: jest.fn() };
  let service: SupportTicketService;

  beforeEach(() => {
    jest.clearAllMocks();
    notifications.notify.mockResolvedValue(undefined);
    service = new SupportTicketService(
      repo as unknown as SupportTicketRepository,
      notifications as unknown as NotificationsService,
    );
  });

  it.each([
    [{ subject: ' Login help ', message: ' Please help ' }, 'other', 'normal'],
    [
      {
        subject: ' Billing ',
        message: ' Refund ',
        category: 'billing',
        priority: 'high',
      },
      'billing',
      'high',
    ],
  ])(
    'creates and acknowledges a support ticket',
    async (dto, category, priority) => {
      const ticket = {
        _id: 'ticket-id',
        subject: dto.subject.trim(),
        category,
        priority,
      };
      repo.create.mockResolvedValue(ticket);

      await expect(service.createTicket('user-id', dto as never)).resolves.toBe(
        ticket,
      );
      expect(repo.create).toHaveBeenCalledWith({
        userId: 'user-id',
        subject: dto.subject.trim(),
        category,
        priority,
        message: dto.message.trim(),
      });
      expect(notifications.notify).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-id',
          dedupeKey: 'support-ticket-created:ticket-id',
        }),
      );
    },
  );

  it.each([
    [{}, 1, 20, 45, 3, true, false],
    [{ page: 3, limit: 10, status: 'open' }, 3, 10, 21, 3, false, true],
  ])(
    'paginates user tickets',
    async (query, page, limit, total, totalPages, hasNextPage, hasPrevPage) => {
      repo.listForUser.mockResolvedValue({ items: ['ticket'], total });

      await expect(
        service.listTickets('user', query as never),
      ).resolves.toEqual({
        items: ['ticket'],
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      });
      expect(repo.listForUser).toHaveBeenCalledWith(
        'user',
        page,
        limit,
        (query as { status?: string }).status,
      );
    },
  );

  it('returns an owned ticket', async () => {
    const ticket = { _id: 'ticket' };
    repo.findForUser.mockResolvedValue(ticket);
    await expect(service.getTicket('user', 'ticket')).resolves.toBe(ticket);
  });

  it('rejects a missing owned ticket', async () => {
    repo.findForUser.mockResolvedValue(null);
    await expect(service.getTicket('user', 'missing')).rejects.toBeInstanceOf(
      AppException,
    );
  });

  it('adds and acknowledges a user reply', async () => {
    const ticket = { subject: 'Help', messages: [{}, {}] };
    repo.addUserReply.mockResolvedValue(ticket);

    await expect(
      service.replyToTicket('user', 'ticket', { message: ' Reply ' }),
    ).resolves.toBe(ticket);
    expect(repo.addUserReply).toHaveBeenCalledWith('ticket', 'user', 'Reply');
    expect(notifications.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        dedupeKey: 'support-ticket-reply:ticket:2',
      }),
    );
  });

  it('rejects a reply to a missing or closed ticket', async () => {
    repo.addUserReply.mockResolvedValue(null);
    await expect(
      service.replyToTicket('user', 'ticket', { message: 'Reply' }),
    ).rejects.toBeInstanceOf(AppException);
  });

  it('closes an open owned ticket', async () => {
    const ticket = { status: 'closed' };
    repo.closeForUser.mockResolvedValue(ticket);
    await expect(service.closeTicket('user', 'ticket')).resolves.toBe(ticket);
  });

  it('rejects closing a missing or closed ticket', async () => {
    repo.closeForUser.mockResolvedValue(null);
    await expect(service.closeTicket('user', 'ticket')).rejects.toBeInstanceOf(
      AppException,
    );
  });

  it.each([
    [{}, 1, 20, 41, 3, true, false],
    [
      { page: 2, limit: 10, status: 'open', priority: 'high' },
      2,
      10,
      15,
      2,
      false,
      true,
    ],
  ])(
    'paginates administrative tickets',
    async (query, page, limit, total, totalPages, hasNextPage, hasPrevPage) => {
      repo.listAll.mockResolvedValue({ items: ['ticket'], total });
      await expect(service.listAllTickets(query as never)).resolves.toEqual({
        items: ['ticket'],
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      });
    },
  );

  it('adds and notifies an agent reply', async () => {
    const ticket = {
      userId: 'user-id',
      subject: 'Help',
      messages: [{}, {}, {}],
    };
    repo.addAgentReply.mockResolvedValue(ticket);

    await expect(
      service.replyAsAgent('agent', 'ticket', { message: ' Answer ' }),
    ).resolves.toBe(ticket);
    expect(notifications.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-id',
        dedupeKey: 'support-agent-reply:ticket:3',
      }),
    );
  });

  it('rejects an agent reply to a missing or closed ticket', async () => {
    repo.addAgentReply.mockResolvedValue(null);
    await expect(
      service.replyAsAgent('agent', 'ticket', { message: 'Answer' }),
    ).rejects.toBeInstanceOf(AppException);
  });

  it('updates ticket status and rejects a missing ticket', async () => {
    const ticket = { status: 'resolved' };
    repo.updateStatus.mockResolvedValueOnce(ticket).mockResolvedValueOnce(null);

    await expect(
      service.updateTicketStatus('ticket', { status: 'resolved' } as never),
    ).resolves.toBe(ticket);
    await expect(
      service.updateTicketStatus('missing', { status: 'closed' } as never),
    ).rejects.toBeInstanceOf(AppException);
  });
});
