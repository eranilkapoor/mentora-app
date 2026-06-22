import { SiblingType } from '@/common/enums';
import { normalizeStoredSiblings } from './202606220001-normalize-profile-siblings.migration';

describe('normalize profile siblings migration', () => {
  it('trims stale details and derives married totals', () => {
    const result = normalizeStoredSiblings({
      brothersCount: 0,
      sistersCount: 1,
      marriedBrothersCount: 5,
      marriedSistersCount: 0,
      details: [
        { type: SiblingType.BROTHER, married: true, occupation: 'Doctor' },
        { type: SiblingType.SISTER, married: true, occupation: 'Engineer' },
      ],
    });

    expect(result.details).toEqual([
      { type: SiblingType.SISTER, married: true, occupation: 'Engineer' },
    ]);
    expect(result.marriedBrothersCount).toBe(0);
    expect(result.marriedSistersCount).toBe(1);
  });
});
