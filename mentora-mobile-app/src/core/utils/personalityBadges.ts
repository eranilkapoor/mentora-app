import { TFunction } from 'i18next';
import { PersonalityBadge, PersonalityBadges } from '@/core/types';

export type PersonalityBadgeOption = {
  value: PersonalityBadge;
  label: string;
  icon: string;
};

export const personalityBadgeIconByValue: Record<PersonalityBadge, string> = {
  [PersonalityBadges.CURIOUS_LEARNER]: 'search',
  [PersonalityBadges.GOAL_ORIENTED]: 'target',
  [PersonalityBadges.CONSISTENT_PRACTICE]: 'repeat',
  [PersonalityBadges.EXAM_FOCUSED]: 'clipboard',
  [PersonalityBadges.PROJECT_BUILDER]: 'tool',
  [PersonalityBadges.FAST_TRACK]: 'zap',
  [PersonalityBadges.STEP_BY_STEP]: 'list',
  [PersonalityBadges.BOOK_LOVER]: 'book-open',
  [PersonalityBadges.STEM_LEARNER]: 'cpu',
  [PersonalityBadges.CREATIVE_THINKER]: 'edit-3',
  [PersonalityBadges.CONFIDENCE_BUILDING]: 'trending-up',
  [PersonalityBadges.REVISION_READY]: 'refresh-cw',
};

const humanizeBadge = (value: string): string =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

export const getPersonalityBadgeLabel = (value: string, t: TFunction): string =>
  t(`options.personality_badges.${value}`, {
    defaultValue: humanizeBadge(value),
  });

export const getPersonalityBadgeIcon = (value: string): string =>
  personalityBadgeIconByValue[value as PersonalityBadge] ?? 'book-open';

export const getPersonalityBadgeOptions = (
  t: TFunction
): PersonalityBadgeOption[] =>
  Object.values(PersonalityBadges).map((value) => ({
    value,
    label: getPersonalityBadgeLabel(value, t),
    icon: getPersonalityBadgeIcon(value),
  }));
