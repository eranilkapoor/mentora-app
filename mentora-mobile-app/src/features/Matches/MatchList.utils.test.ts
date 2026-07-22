import type { DiscoveryProfile } from '@/store/services/matchApi.service';
import { formatMatchEducation } from './MatchList.utils';

const t = (key: string, options: { defaultValue: string }) =>
  key === 'options.qualifications.btech' ? 'B.Tech' : options.defaultValue;

const profile = (
  education: DiscoveryProfile['education']
): DiscoveryProfile => ({
  userId: 'user-1',
  education,
});

describe('MatchList utils', () => {
  it('formats education from qualification when available', () => {
    expect(formatMatchEducation(profile({ qualification: 'btech' }), t)).toBe(
      'B.Tech'
    );
  });

  it('falls back to other education fields when qualification is missing', () => {
    expect(
      formatMatchEducation(profile({ field: 'Computer Science' }), t)
    ).toBe('Computer Science');
    expect(formatMatchEducation(profile({ jobRole: 'Engineer' }), t)).toBe(
      'Engineer'
    );
  });

  it('formats qualification from alternate API shapes', () => {
    expect(
      formatMatchEducation(
        {
          userId: 'user-1',
          qualification: 'btech',
        } as unknown as DiscoveryProfile,
        t
      )
    ).toBe('B.Tech');

    expect(
      formatMatchEducation(
        {
          userId: 'user-1',
          education: { qualification: { value: 'btech' } },
        } as unknown as DiscoveryProfile,
        t
      )
    ).toBe('B.Tech');
  });

  it('uses dash only when no education context is available', () => {
    expect(formatMatchEducation(profile({}), t)).toBe('-');
  });
});
