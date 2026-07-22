export const SUPPORT_TICKET_CATEGORIES = [
  'account',
  'billing',
  'classes',
  'ai_tutor',
  'schedules',
  'progress',
  'chat',
  'safety',
  'technical',
  'feedback',
  'other',
] as const;

export const SUPPORT_TICKET_PRIORITIES = [
  'low',
  'normal',
  'high',
  'urgent',
] as const;

export const SUPPORT_TICKET_STATUSES = [
  'open',
  'pending',
  'resolved',
  'closed',
] as const;

export const SUPPORT_TICKET_MESSAGE_AUTHOR_TYPES = [
  'user',
  'agent',
  'system',
] as const;

export type SupportTicketCategory = (typeof SUPPORT_TICKET_CATEGORIES)[number];
export type SupportTicketPriority = (typeof SUPPORT_TICKET_PRIORITIES)[number];
export type SupportTicketStatus = (typeof SUPPORT_TICKET_STATUSES)[number];
export type SupportTicketMessageAuthorType =
  (typeof SUPPORT_TICKET_MESSAGE_AUTHOR_TYPES)[number];
