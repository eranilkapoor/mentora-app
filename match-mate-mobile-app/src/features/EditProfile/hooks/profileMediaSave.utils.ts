export interface ProfileMediaSavePlan {
  removedIds: string[];
  remove: (mediaId: string) => Promise<void>;
  upload?: () => Promise<string | undefined>;
  preferredPrimaryId?: string | null;
  hadExistingVisibleMedia: boolean;
  setPrimary: (mediaId: string) => Promise<void>;
}

export const executeProfileMediaSave = async (
  plan: ProfileMediaSavePlan
): Promise<void> => {
  for (const mediaId of plan.removedIds) {
    await plan.remove(mediaId);
  }

  const uploadedPrimaryId = await plan.upload?.();
  const primaryId =
    plan.preferredPrimaryId ??
    (!plan.hadExistingVisibleMedia ? uploadedPrimaryId : undefined);

  if (primaryId) {
    await plan.setPrimary(primaryId);
  }
};
