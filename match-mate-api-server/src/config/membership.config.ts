import { PlanTier } from 'src/common/enums';

export const MembershipFeatures = {
  [PlanTier.FREE]: {
    dailyLikes: 10,
    canChat: false,
  },
  [PlanTier.GOLD]: {
    dailyLikes: 100,
    canChat: true,
  },
  [PlanTier.PLATINUM]: {
    dailyLikes: Infinity,
    canChat: true,
    priorityBoost: true,
  },
};

export default () => ({
  membership: {
    freeLikes: 10,
    goldLikes: 100,
    platinumLikes: -1,
  },
});
