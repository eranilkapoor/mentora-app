import { MembershipTier } from "src/common/enums";

export const MembershipFeatures = {
  [MembershipTier.FREE]: {
    dailyLikes: 10,
    canChat: false,
  },
  [MembershipTier.GOLD]: {
    dailyLikes: 100,
    canChat: true,
  },
  [MembershipTier.PLATINUM]: {
    dailyLikes: Infinity,
    canChat: true,
    priorityBoost: true,
  },
};