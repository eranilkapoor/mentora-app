export enum InteractionCategory {
  DISCOVERY = 'discovery',
  MATCHING = 'matching',
  ENGAGEMENT = 'engagement',
  PREMIUM = 'premium',
  SAFETY = 'safety',
}

export const InteractionCategoryMap = {
  send_interest: 'matching',
  shortlist: 'engagement',
  block: 'safety',
};
