export interface ReferredUser {
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  joinedAt?: string;
  status: string;
  registrationPoints: number;
  subscriptionPoints: number;
  totalPoints: number;
  subscribedAt?: string;
}

export interface ReferralSummary {
  referralCode: string;
  totalPoints: number;
  redeemablePoints: number;
  pendingPoints: number;
  redemptionThreshold: number;
  registrationBonusPoints: number;
  subscriptionRewardRate: number;
  referredUsers: ReferredUser[];
}
