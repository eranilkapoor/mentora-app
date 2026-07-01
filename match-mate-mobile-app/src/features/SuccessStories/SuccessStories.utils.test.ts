import {
  getSuccessStoryStatusMeta,
  isSuccessStoryDraftValid,
  normalizeSuccessStoryDraft,
  SuccessStoryDraft,
} from './SuccessStories.utils';

const validDraft: SuccessStoryDraft = {
  title: 'Our Match Mate journey',
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
        title: '  Our Match Mate journey ',
        partnerName: ' Asha ',
        location: ' ',
      })
    ).toEqual({
      title: 'Our Match Mate journey',
      partnerName: 'Asha',
      marriageDate: '2026-02-14',
      story: 'A'.repeat(100),
      publicationConsent: true,
    });
  });

  it('maps moderation states to consistent labels, notes, and tones', () => {
    expect(getSuccessStoryStatusMeta('submitted')).toEqual({
      labelKey: 'settings.success_stories.status_submitted',
      noteKey: 'settings.success_stories.note_submitted',
      tone: 'primary',
    });
    expect(getSuccessStoryStatusMeta('published')).toEqual({
      labelKey: 'settings.success_stories.status_published',
      noteKey: 'settings.success_stories.note_published',
      tone: 'success',
    });
    expect(getSuccessStoryStatusMeta('rejected')).toEqual({
      labelKey: 'settings.success_stories.status_rejected',
      noteKey: 'settings.success_stories.note_rejected',
      tone: 'warning',
    });
    expect(getSuccessStoryStatusMeta('archived')).toEqual({
      labelKey: 'settings.success_stories.status_archived',
      noteKey: 'settings.success_stories.note_archived',
      tone: 'muted',
    });
  });
});
