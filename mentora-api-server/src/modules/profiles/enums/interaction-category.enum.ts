export enum InteractionCategory {
  DISCOVERY = 'discovery',
  LEARNING = 'learning',
  ENGAGEMENT = 'engagement',
  PREMIUM = 'premium',
  SAFETY = 'safety',
}

export const INTERACTION_CATEGORY_MAP = {
  request_session: 'learning',
  save_subject: 'engagement',
  block: 'safety',
};
