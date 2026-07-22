import { Injectable } from '@nestjs/common';
import { VerificationStatus } from '@/modules/safety/enums/verification.enums';

export interface ProfileScoreInput {
  [key: string]: unknown;
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
    const education = profile.education ?? {};
    const family = profile.family ?? {};

    const checks: Array<{ key: string; passed: boolean }> = [
      {
        key: 'personal',
        passed:
          this.hasValue(personal.firstName) &&
          this.hasValue(personal.gender) &&
          this.hasValue(personal.dateOfBirth) &&
          this.hasValue(personal.religion),
      },
      {
        key: 'academic',
        passed:
          this.hasValue(education.qualification) &&
          this.hasValue(education.field) &&
          this.hasValue(education.university) &&
          this.hasValue(education.occupation),
      },
      {
        key: 'parents',
        passed:
          this.hasValue(family.fatherName) ||
          this.hasValue(family.motherName) ||
          this.hasValue(family.guardianName),
      },
      {
        key: 'address',
        passed:
          this.hasValue(personal.country) &&
          this.hasValue(personal.state) &&
          this.hasValue(personal.city),
      },
      {
        key: 'previousEducation',
        passed: this.hasValue(education.previousEducationSummary),
      },
      {
        key: 'examScores',
        passed: this.hasValue(education.examScoreSummary),
      },
      {
        key: 'coursePreference',
        passed:
          this.hasValue(education.preferredSubjects) ||
          this.hasValue(education.coursePreference),
      },
      {
        key: 'documents',
        passed: this.hasValue(profile.documents),
      },
      {
        key: 'payments',
        passed:
          this.hasValue(profile.learningEntitlements) ||
          this.hasValue(profile.paymentSummary),
      },
      {
        key: 'communicationHistory',
        passed: this.hasValue(profile.communicationHistory),
      },
      {
        key: 'activityTimeline',
        passed: this.hasValue(profile.activityTimeline),
      },
      { key: 'aboutMe', passed: this.hasLongText(personal.aboutMe, 50) },
      {
        key: 'personalityBadges',
        passed:
          Array.isArray(personal.personalityBadges) &&
          personal.personalityBadges.length >= 3,
      },
      { key: 'profilePhoto', passed: Number(media.imageCount ?? 0) > 0 },
    ];

    const completed = checks.filter((check) => check.passed).length;
    const completion = Math.round((completed / checks.length) * 100);

    let quality = 45;
    quality += completion * 0.35;
    if (personal.aboutMe) quality += 8;
    if (this.hasLongText(personal.aboutMe, 120)) quality += 4;
    if (
      Array.isArray(personal.personalityBadges) &&
      personal.personalityBadges.length >= 3
    ) {
      quality += 5;
    }
    if (education.university) quality += 5;
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

  private hasValue(value: unknown): boolean {
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined;
  }

  private hasLongText(value: unknown, minLength: number): boolean {
    return typeof value === 'string' && value.trim().length >= minLength;
  }
}
