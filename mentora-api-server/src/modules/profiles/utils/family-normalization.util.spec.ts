import { SiblingType } from '@/common/enums';
import { FamilyDto } from '../dto/create-profile.dto';
import { normalizeFamilySiblings } from './family-normalization.util';

const familyWithSiblings = (
  siblings: NonNullable<FamilyDto['siblings']>,
): FamilyDto => ({ siblings });

describe('normalizeFamilySiblings', () => {
  it('derives married totals from the selected sibling details', () => {
    const result = normalizeFamilySiblings(
      familyWithSiblings({
        brothersCount: 2,
        sistersCount: 1,
        marriedBrothersCount: 0,
        marriedSistersCount: 0,
        details: [
          { type: SiblingType.BROTHER, married: true, occupation: 'Doctor' },
          { type: SiblingType.BROTHER, married: false, occupation: 'Teacher' },
          { type: SiblingType.SISTER, married: true, occupation: 'Engineer' },
        ],
      }),
    );

    expect(result?.siblings?.marriedBrothersCount).toBe(1);
    expect(result?.siblings?.marriedSistersCount).toBe(1);
  });

  it('removes stale detail rows when a sibling count is reduced', () => {
    const result = normalizeFamilySiblings(
      familyWithSiblings({
        brothersCount: 0,
        sistersCount: 1,
        marriedBrothersCount: 1,
        marriedSistersCount: 0,
        details: [
          { type: SiblingType.BROTHER, married: true, occupation: 'Doctor' },
          { type: SiblingType.SISTER, married: false, occupation: 'Teacher' },
        ],
      }),
    );

    expect(result?.siblings?.details).toEqual([
      { type: SiblingType.SISTER, married: false, occupation: 'Teacher' },
    ]);
    expect(result?.siblings?.marriedBrothersCount).toBe(0);
  });

  it('adds safe defaults when counts exceed supplied details', () => {
    const result = normalizeFamilySiblings(
      familyWithSiblings({
        brothersCount: 1,
        sistersCount: 1,
        marriedBrothersCount: 9,
        marriedSistersCount: 9,
        details: [],
      }),
    );

    expect(result?.siblings?.details).toEqual([
      { type: SiblingType.BROTHER, married: false, occupation: '' },
      { type: SiblingType.SISTER, married: false, occupation: '' },
    ]);
    expect(result?.siblings?.marriedBrothersCount).toBe(0);
    expect(result?.siblings?.marriedSistersCount).toBe(0);
  });
});
