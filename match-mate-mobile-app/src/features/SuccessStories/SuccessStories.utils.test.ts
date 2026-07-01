import {
  isSuccessStoryDraftValid,
  normalizeSuccessStoryDraft,
  SuccessStoryDraft,
} from './SuccessStories.utils';

const validDraft: SuccessStoryDraft = {
  title: 'Our MatchMate journey',
  partnerName: 'Asha',
  marriageDate: '2026-02-14',
  story: 'A'.repeat(100),
  location: ' Mumbai ',
  publicationConsent: true,
};

describe('success story submission', () => {
  it('requires meaningful content, a valid date, and publication consent', () => {
    expect(isSuccessStoryDraftValid(validDraft)).toBe(true);
    expect(
      isSuccessStoryDraftValid({ ...validDraft, story: 'Too short' })
    ).toBe(false);
    expect(
      isSuccessStoryDraftValid({ ...validDraft, publicationConsent: false })
    ).toBe(false);
    expect(
      isSuccessStoryDraftValid({ ...validDraft, marriageDate: 'not-a-date' })
    ).toBe(false);
  });

  it('trims submitted text and omits empty optional fields', () => {
    expect(
      normalizeSuccessStoryDraft({
        ...validDraft,
        title: '  Our MatchMate journey ',
        partnerName: ' Asha ',
        location: ' ',
      })
    ).toEqual({
      title: 'Our MatchMate journey',
      partnerName: 'Asha',
      marriageDate: '2026-02-14',
      story: 'A'.repeat(100),
      publicationConsent: true,
    });
  });
});
