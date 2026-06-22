import { INITIAL_SIBLINGS } from '../EditProfile.constants';
import type { SiblingDetail, Siblings } from '../EditProfile.types';

export type ProfileSiblingType = 'brother' | 'sister';

export const createSiblingDetail = (
  type: ProfileSiblingType
): SiblingDetail => ({
  type,
  married: false,
  occupation: '',
});

const normalizeSiblingDetails = (
  details: SiblingDetail[],
  type: ProfileSiblingType,
  count: number
): SiblingDetail[] => {
  const matching = details.filter((item) => item.type === type).slice(0, count);
  return matching.length < count
    ? [
        ...matching,
        ...Array.from({ length: count - matching.length }, () =>
          createSiblingDetail(type)
        ),
      ]
    : matching;
};

export const normalizeSiblings = (value?: Siblings): Siblings => {
  const source = value ?? INITIAL_SIBLINGS;
  const brothersCount = Math.max(0, Math.floor(source.brothersCount || 0));
  const sistersCount = Math.max(0, Math.floor(source.sistersCount || 0));
  const sourceDetails = Array.isArray(source.details) ? source.details : [];
  const details = [
    ...normalizeSiblingDetails(sourceDetails, 'brother', brothersCount),
    ...normalizeSiblingDetails(sourceDetails, 'sister', sistersCount),
  ];

  return {
    ...source,
    brothersCount,
    sistersCount,
    details,
    marriedBrothersCount: details.filter(
      (item) => item.type === 'brother' && item.married
    ).length,
    marriedSistersCount: details.filter(
      (item) => item.type === 'sister' && item.married
    ).length,
  };
};
