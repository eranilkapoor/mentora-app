import type {
  CreateSupportTicketRequest,
  SupportTicketCategory,
  SupportTicketPriority,
} from '@/store/services/supportApi.service';

export interface SupportTicketDraft {
  subject: string;
  message: string;
  category: SupportTicketCategory;
  priority: SupportTicketPriority;
}

export const isSupportTicketDraftValid = (draft: SupportTicketDraft): boolean =>
  draft.subject.trim().length >= 4 && draft.message.trim().length >= 10;

export const buildSupportTicketRequest = (
  draft: SupportTicketDraft
): CreateSupportTicketRequest => ({
  subject: draft.subject.trim(),
  message: draft.message.trim(),
  category: draft.category,
  priority: draft.priority,
});
