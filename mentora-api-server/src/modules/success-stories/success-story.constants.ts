export const SUCCESS_STORY_STATUSES = [
  'submitted',
  'published',
  'rejected',
  'archived',
] as const;

export type SuccessStoryStatus = (typeof SUCCESS_STORY_STATUSES)[number];
