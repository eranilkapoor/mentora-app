export interface ReferralUserSummary {
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  joinedAt?: Date;
  status: string;
  registrationPoints: number;
  subscriptionPoints: number;
  totalPoints: number;
  subscribedAt?: Date;
}

export interface ReferralSummary {
  referralCode: string;
  totalPoints: number;
  redeemablePoints: number;
  pendingPoints: number;
  redemptionThreshold: number;
  registrationBonusPoints: number;
  subscriptionRewardRate: number;
  referredUsers: ReferralUserSummary[];
}
