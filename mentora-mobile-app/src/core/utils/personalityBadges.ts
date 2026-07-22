import { TFunction } from 'i18next';
import { PersonalityBadge, PersonalityBadges } from '@/core/types';

export type PersonalityBadgeOption = {
  value: PersonalityBadge;
  label: string;
  icon: string;
};

export const personalityBadgeIconByValue: Record<PersonalityBadge, string> = {
  [PersonalityBadges.FAMILY_ORIENTED]: 'users',
  [PersonalityBadges.MARRIAGE_FOCUSED]: 'heart',
  [PersonalityBadges.TRADITIONAL_VALUES]: 'home',
  [PersonalityBadges.MODERN_THINKER]: 'cpu',
  [PersonalityBadges.CAREER_FOCUSED]: 'briefcase',
  [PersonalityBadges.ENTREPRENEUR]: 'trending-up',
  [PersonalityBadges.SPIRITUAL]: 'sun',
  [PersonalityBadges.RELIGIOUS]: 'bookmark',
  [PersonalityBadges.TRAVELER]: 'compass',
  [PersonalityBadges.FOODIE]: 'coffee',
  [PersonalityBadges.BOOK_LOVER]: 'book-open',
  [PersonalityBadges.MUSIC_LOVER]: 'music',
  [PersonalityBadges.FITNESS_ENTHUSIAST]: 'activity',
  [PersonalityBadges.PET_LOVER]: 'smile',
  [PersonalityBadges.NATURE_LOVER]: 'feather',
  [PersonalityBadges.AMBITIOUS]: 'target',
  [PersonalityBadges.CALM_NATURE]: 'cloud',
  [PersonalityBadges.FRIENDLY]: 'user-plus',
  [PersonalityBadges.HUMOROUS]: 'smile',
  [PersonalityBadges.SUPPORTIVE]: 'shield',
};

const humanizeBadge = (value: string): string =>
  value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

export const getPersonalityBadgeLabel = (value: string, t: TFunction): string =>
  t(`options.personality_badges.${value}`, {
    defaultValue: humanizeBadge(value),
  });

export const getPersonalityBadgeIcon = (value: string): string =>
  personalityBadgeIconByValue[value as PersonalityBadge] ?? 'heart';

export const getPersonalityBadgeOptions = (
  t: TFunction
): PersonalityBadgeOption[] =>
  Object.values(PersonalityBadges).map((value) => ({
    value,
    label: getPersonalityBadgeLabel(value, t),
    icon: getPersonalityBadgeIcon(value),
  }));
