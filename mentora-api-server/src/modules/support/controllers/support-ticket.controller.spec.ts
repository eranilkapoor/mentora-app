import { SupportTicketController } from './support-ticket.controller';
import { SuccessCode } from '@/common/constants';

describe('SupportTicketController', () => {
  const userId = 'user-1';
  const ticketId = 'ticket-1';
  const req = { user: { sub: userId } } as never;

  const service = {
    createTicket: jest.fn(),
    listTickets: jest.fn(),
    getTicket: jest.fn(),
    replyToTicket: jest.fn(),
    closeTicket: jest.fn(),
  };

  let controller: SupportTicketController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new SupportTicketController(service as never);
  });

  it('creates, lists, and fetches user support tickets', async () => {
    const createDto = {
      subject: 'Payment issue',
      message: 'Payment failed',
      category: 'billing',
    } as never;
    const query = { page: 1, limit: 10 } as never;
    service.createTicket.mockResolvedValue({ id: ticketId });
    service.listTickets.mockResolvedValue({ items: [] });
    service.getTicket.mockResolvedValue({ id: ticketId });

    const created = await controller.createTicket(req, createDto);
    const list = await controller.listTickets(req, query);
    const detail = await controller.getTicket(req, ticketId);

    expect(service.createTicket).toHaveBeenCalledWith(userId, createDto);
    expect(service.listTickets).toHaveBeenCalledWith(userId, query);
    expect(service.getTicket).toHaveBeenCalledWith(userId, ticketId);
    expect(created.code).toBe(SuccessCode.SUPPORT_TICKET_CREATED);
    expect(list.code).toBe(SuccessCode.SUPPORT_TICKETS_FETCHED);
    expect(detail.code).toBe(SuccessCode.SUPPORT_TICKET_FETCHED);
  });

  it('replies to and closes a support ticket', async () => {
    const dto = { message: 'Please check again' };
    service.replyToTicket.mockResolvedValue({ id: ticketId });
    service.closeTicket.mockResolvedValue({ id: ticketId, status: 'closed' });

    const reply = await controller.replyToTicket(req, ticketId, dto);
    const closed = await controller.closeTicket(req, ticketId);

    expect(service.replyToTicket).toHaveBeenCalledWith(userId, ticketId, dto);
    expect(service.closeTicket).toHaveBeenCalledWith(userId, ticketId);
    expect(reply.code).toBe(SuccessCode.SUPPORT_TICKET_REPLIED);
    expect(closed.code).toBe(SuccessCode.SUPPORT_TICKET_CLOSED);
  });
});
