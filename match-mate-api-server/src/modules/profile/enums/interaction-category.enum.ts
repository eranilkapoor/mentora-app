export enum InteractionCategory {
  DISCOVERY = 'discovery',
  MATCHING = 'matching',
  ENGAGEMENT = 'engagement',
  PREMIUM = 'premium',
  SAFETY = 'safety',
}

export const InteractionCategoryMap = {
  like: 'matching',
  pass: 'matching',
  block: 'safety',
};
