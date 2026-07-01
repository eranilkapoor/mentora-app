import {
  buildSupportTicketRequest,
  isSupportTicketDraftValid,
  SupportTicketDraft,
} from './SupportTickets.utils';

const validDraft: SupportTicketDraft = {
  subject: 'Billing issue',
  message: 'My renewal was charged twice.',
  category: 'billing',
  priority: 'high',
};

describe('support ticket workflow', () => {
  it.each([
    ['short subject', { ...validDraft, subject: '   abc   ' }],
    ['short message', { ...validDraft, message: ' 123456789 ' }],
  ])('rejects a %s', (_caseName, draft) => {
    expect(isSupportTicketDraftValid(draft)).toBe(false);
  });

  it('accepts the minimum trimmed lengths', () => {
    expect(
      isSupportTicketDraftValid({
        ...validDraft,
        subject: ' abcd ',
        message: ' 1234567890 ',
      })
    ).toBe(true);
  });

  it('normalizes user text and preserves routing fields', () => {
    expect(
      buildSupportTicketRequest({
        ...validDraft,
        subject: '  Billing issue  ',
        message: '  My renewal was charged twice.  ',
      })
    ).toEqual(validDraft);
  });
});
