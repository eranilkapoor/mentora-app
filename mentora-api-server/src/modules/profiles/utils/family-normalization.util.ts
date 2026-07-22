import { SiblingType } from '@/common/enums';
import { FamilyDto, SiblingsDto } from '../dto/create-profile.dto';

export function normalizeFamilySiblings(
  family?: FamilyDto,
): FamilyDto | undefined {
  if (!family?.siblings) return family;

  const siblings = family.siblings;
  const brothersCount = Math.max(
    0,
    Math.floor(Number(siblings.brothersCount) || 0),
  );
  const sistersCount = Math.max(
    0,
    Math.floor(Number(siblings.sistersCount) || 0),
  );
  const sourceDetails = Array.isArray(siblings.details) ? siblings.details : [];

  const normalizeDetails = (type: SiblingType, count: number) => {
    const matching = sourceDetails
      .filter((detail) => detail.type === type)
      .slice(0, count);

    while (matching.length < count) {
      matching.push({ type, married: false, occupation: '' });
    }

    return matching;
  };

  const details = [
    ...normalizeDetails(SiblingType.BROTHER, brothersCount),
    ...normalizeDetails(SiblingType.SISTER, sistersCount),
  ];
  const normalizedSiblings: SiblingsDto = {
    ...siblings,
    brothersCount,
    sistersCount,
    details,
    marriedBrothersCount: details.filter(
      (detail) =>
        detail.type === SiblingType.BROTHER && detail.married === true,
    ).length,
    marriedSistersCount: details.filter(
      (detail) => detail.type === SiblingType.SISTER && detail.married === true,
    ).length,
  };

  return { ...family, siblings: normalizedSiblings };
}
