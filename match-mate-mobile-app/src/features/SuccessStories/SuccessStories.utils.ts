import type { SubmitSuccessStoryRequest } from '@/store/services/successStoryApi.service';

export type SuccessStoryDraft = SubmitSuccessStoryRequest;

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
