export enum InteractionCategory {
  DISCOVERY = 'discovery',
  MATCHING = 'matching',
  ENGAGEMENT = 'engagement',
  PREMIUM = 'premium',
  SAFETY = 'safety',
}

const InteractionCategoryMap = {
  like: 'matching',
  pass: 'matching',
  block: 'safety',
};