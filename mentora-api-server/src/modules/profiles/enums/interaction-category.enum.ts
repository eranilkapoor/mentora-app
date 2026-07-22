export enum InteractionCategory {
  DISCOVERY = 'discovery',
  MATCHING = 'matching',
  ENGAGEMENT = 'engagement',
  PREMIUM = 'premium',
  SAFETY = 'safety',
}

export const INTERACTION_CATEGORY_MAP = {
  send_interest: 'matching',
  shortlist: 'engagement',
  block: 'safety',
};
