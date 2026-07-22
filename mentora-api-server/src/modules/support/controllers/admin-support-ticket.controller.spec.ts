import { AdminSupportTicketController } from './admin-support-ticket.controller';
import { SuccessCode } from '@/common/constants';

describe('AdminSupportTicketController', () => {
  const userId = 'support-1';
  const ticketId = 'ticket-1';
  const req = { user: { sub: userId } } as never;

  const service = {
    listAllTickets: jest.fn(),
    replyAsAgent: jest.fn(),
    updateTicketStatus: jest.fn(),
  };

  let controller: AdminSupportTicketController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AdminSupportTicketController(service as never);
  });

  it('lists all support tickets for admins and support staff', async () => {
    const query = { page: 1, limit: 10 } as never;
    service.listAllTickets.mockResolvedValue({ items: [] });

    const response = await controller.listTickets(query);

    expect(service.listAllTickets).toHaveBeenCalledWith(query);
    expect(response.code).toBe(SuccessCode.SUPPORT_TICKETS_FETCHED);
  });

  it('adds agent replies and updates ticket status', async () => {
    const replyDto = { message: 'We are checking this' } as never;
    const statusDto = { status: 'resolved' } as never;
    service.replyAsAgent.mockResolvedValue({ id: ticketId });
    service.updateTicketStatus.mockResolvedValue({ id: ticketId });

    const reply = await controller.replyAsAgent(req, ticketId, replyDto);
    const status = await controller.updateStatus(ticketId, statusDto);

    expect(service.replyAsAgent).toHaveBeenCalledWith(
      userId,
      ticketId,
      replyDto,
    );
    expect(service.updateTicketStatus).toHaveBeenCalledWith(
      ticketId,
      statusDto,
    );
    expect(reply.code).toBe(SuccessCode.SUPPORT_TICKET_REPLIED);
    expect(status.code).toBe(SuccessCode.SUPPORT_TICKET_UPDATED);
  });
});
