import type { SubmitSuccessStoryRequest } from '@/store/services/successStoryApi.service';
import type { SuccessStoryStatus } from '@/store/services/successStoryApi.service';

export type SuccessStoryDraft = SubmitSuccessStoryRequest;

export type SuccessStoryStatusTone =
  'primary' | 'success' | 'warning' | 'muted';

export const isSuccessStoryDraftValid = (draft: SuccessStoryDraft): boolean =>
  draft.title.trim().length >= 4 &&
  draft.partnerName.trim().length >= 2 &&
  draft.story.trim().length >= 100 &&
  Boolean(Date.parse(draft.marriageDate)) &&
  draft.publicationConsent;

export const normalizeSuccessStoryDraft = (
  draft: SuccessStoryDraft
): SubmitSuccessStoryRequest => ({
  title: draft.title.trim(),
  partnerName: draft.partnerName.trim(),
  story: draft.story.trim(),
  marriageDate: draft.marriageDate,
  ...(draft.location?.trim() ? { location: draft.location.trim() } : {}),
  ...(draft.photoUrls?.length ? { photoUrls: draft.photoUrls } : {}),
  publicationConsent: draft.publicationConsent,
});

export const getSuccessStoryStatusMeta = (
  status: SuccessStoryStatus
): {
  labelKey: string;
  noteKey: string;
  tone: SuccessStoryStatusTone;
} => {
  switch (status) {
    case 'published':
      return {
        labelKey: 'settings.success_stories.status_published',
        noteKey: 'settings.success_stories.note_published',
        tone: 'success',
      };
    case 'rejected':
      return {
        labelKey: 'settings.success_stories.status_rejected',
        noteKey: 'settings.success_stories.note_rejected',
        tone: 'warning',
      };
    case 'archived':
      return {
        labelKey: 'settings.success_stories.status_archived',
        noteKey: 'settings.success_stories.note_archived',
        tone: 'muted',
      };
    case 'submitted':
    default:
      return {
        labelKey: 'settings.success_stories.status_submitted',
        noteKey: 'settings.success_stories.note_submitted',
        tone: 'primary',
      };
  }
};
