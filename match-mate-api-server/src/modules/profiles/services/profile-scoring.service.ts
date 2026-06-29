import { Injectable } from '@nestjs/common';
import { VerificationStatus } from '@/modules/safety/enums/verification.enums';

export interface ProfileScoreInput {
  personal?: Record<string, unknown>;
  physical?: Record<string, unknown>;
  education?: Record<string, unknown>;
  family?: Record<string, unknown>;
  verificationStatus?: VerificationStatus;
  isPremium?: boolean;
  lastActiveAt?: Date | string;
}

export interface ProfileMediaScoreInput {
  imageCount?: number;
  videoCount?: number;
}

export interface ProfileScoreResult {
  profileCompletionPercentage: number;
  profileScore: number;
  visibilityScore: number;
  missingFields: string[];
}

@Injectable()
export class ProfileScoringService {
  calculate(
    profile: ProfileScoreInput,
    media: ProfileMediaScoreInput = {},
  ): ProfileScoreResult {
    const personal = profile.personal ?? {};
    const physical = profile.physical ?? {};
    const education = profile.education ?? {};
    const family = profile.family ?? {};

    const checks: Array<{ key: string; passed: boolean }> = [
      { key: 'profileFor', passed: Boolean(personal.profileFor) },
      { key: 'firstName', passed: Boolean(personal.firstName) },
      { key: 'gender', passed: Boolean(personal.gender) },
      { key: 'dateOfBirth', passed: Boolean(personal.dateOfBirth) },
      { key: 'religion', passed: Boolean(personal.religion) },
      { key: 'maritalStatus', passed: Boolean(personal.maritalStatus) },
      { key: 'height', passed: Boolean(physical.height) },
      { key: 'qualification', passed: Boolean(education.qualification) },
      { key: 'occupation', passed: Boolean(education.occupation) },
      { key: 'aboutMe', passed: Boolean(personal.aboutMe) },
      {
        key: 'personalityBadges',
        passed:
          Array.isArray(personal.personalityBadges) &&
          personal.personalityBadges.length >= 3,
      },
      { key: 'family', passed: Object.keys(family).length > 0 },
      { key: 'profilePhoto', passed: Number(media.imageCount ?? 0) > 0 },
    ];

    const completed = checks.filter((check) => check.passed).length;
    const completion = Math.round((completed / checks.length) * 100);

    let quality = 45;
    quality += completion * 0.35;
    if (personal.aboutMe) quality += 8;
    if (
      Array.isArray(personal.personalityBadges) &&
      personal.personalityBadges.length >= 3
    ) {
      quality += 5;
    }
    if (education.annualIncomeAmount) quality += 5;
    if (Number(media.imageCount ?? 0) >= 3) quality += 7;
    if (Number(media.videoCount ?? 0) > 0) quality += 5;

    const profileScore = this.clamp(Math.round(quality));
    const visibilityScore = this.calculateVisibilityScore(
      completion,
      profileScore,
      profile,
      media,
    );

    return {
      profileCompletionPercentage: completion,
      profileScore,
      visibilityScore,
      missingFields: checks
        .filter((check) => !check.passed)
        .map((check) => check.key),
    };
  }

  private calculateVisibilityScore(
    completion: number,
    profileScore: number,
    profile: ProfileScoreInput,
    media: ProfileMediaScoreInput,
  ): number {
    let score = completion * 0.35 + profileScore * 0.3;

    if (profile.verificationStatus === VerificationStatus.APPROVED) score += 12;
    if (profile.isPremium) score += 8;
    if (Number(media.imageCount ?? 0) >= 3) score += 8;
    if (Number(media.videoCount ?? 0) > 0) score += 5;

    const lastActiveAt = profile.lastActiveAt
      ? new Date(profile.lastActiveAt).getTime()
      : 0;
    const daysInactive =
      lastActiveAt > 0
        ? (Date.now() - lastActiveAt) / (24 * 60 * 60 * 1000)
        : 30;

    if (daysInactive <= 1) score += 10;
    else if (daysInactive <= 7) score += 6;
    else if (daysInactive <= 30) score += 2;

    return this.clamp(Math.round(score));
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(100, value));
  }
}
