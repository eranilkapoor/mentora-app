import { Injectable } from '@nestjs/common';
import {
  LeanPreference,
  LeanProfile,
} from '../repositories/match-discovery.repository';

type PreferenceLike = LeanPreference | Record<string, unknown> | null;
type ProfileLike = LeanProfile | Record<string, unknown>;

interface ScoreSignal {
  key: string;
  matched: boolean;
  weight: number;
}

export interface CompatibilityResult {
  score: number;
  myPreferenceScore: number;
  theirPreferenceScore: number;
  signals: ScoreSignal[];
}

const DEFAULT_WEIGHTS = {
  age: 10,
  height: 10,
  religion: 15,
  caste: 10,
  location: 10,
  education: 10,
  occupation: 10,
  lifestyle: 10,
  horoscope: 15,
};

@Injectable()
export class MatchCompatibilityService {
  calculateMutualCompatibility(
    viewerProfile: ProfileLike,
    viewerPreference: PreferenceLike,
    candidateProfile: ProfileLike,
    candidatePreference: PreferenceLike,
  ): CompatibilityResult {
    const viewerToCandidate = this.scoreProfileAgainstPreference(
      candidateProfile,
      viewerPreference,
    );
    const candidateToViewer = this.scoreProfileAgainstPreference(
      viewerProfile,
      candidatePreference,
    );

    return {
      score: Math.round(
        (viewerToCandidate.score + candidateToViewer.score) / 2,
      ),
      myPreferenceScore: viewerToCandidate.score,
      theirPreferenceScore: candidateToViewer.score,
      signals: viewerToCandidate.signals,
    };
  }

  scoreProfileAgainstPreference(
    profile: ProfileLike,
    preference: PreferenceLike,
  ): { score: number; signals: ScoreSignal[] } {
    if (!preference) {
      return {
        score: Number(
          this.get(profile, 'visibilityScore') ??
            this.get(profile, 'profileScore') ??
            50,
        ),
        signals: [],
      };
    }

    const filters = this.get(preference, 'filters') as
      | Record<string, unknown>
      | undefined;
    const weights =
      (this.get(preference, 'weights') as Record<string, number> | undefined) ??
      DEFAULT_WEIGHTS;
    const signals: ScoreSignal[] = [];

    this.addSignal(
      signals,
      'age',
      weights.age,
      this.inRange(this.get(profile, 'age'), filters?.age),
    );
    this.addSignal(
      signals,
      'height',
      weights.height,
      this.inRange(this.get(profile, 'physical.height'), filters?.height),
    );
    this.addSignal(
      signals,
      'religion',
      weights.religion,
      this.inList(this.get(profile, 'personal.religion'), filters?.religion),
    );
    this.addSignal(
      signals,
      'caste',
      weights.caste,
      this.inList(this.get(profile, 'personal.caste'), filters?.caste),
    );
    this.addSignal(
      signals,
      'location',
      weights.location,
      this.locationMatches(profile, filters),
    );
    this.addSignal(
      signals,
      'education',
      weights.education,
      this.inList(
        this.get(profile, 'education.qualification'),
        filters?.qualification,
      ),
    );
    this.addSignal(
      signals,
      'occupation',
      weights.occupation,
      this.inList(
        this.get(profile, 'education.occupationType'),
        filters?.occupationType,
      ),
    );
    this.addSignal(
      signals,
      'lifestyle',
      weights.lifestyle,
      this.lifestyleMatches(profile, filters),
    );
    this.addSignal(
      signals,
      'horoscope',
      weights.horoscope,
      this.inList(
        this.get(profile, 'personal.manglikStatus'),
        filters?.manglikStatus,
      ),
    );

    const totalWeight = signals.reduce(
      (total, signal) => total + signal.weight,
      0,
    );
    if (totalWeight <= 0) return { score: 50, signals };

    const matchedWeight = signals.reduce(
      (total, signal) => total + (signal.matched ? signal.weight : 0),
      0,
    );

    return {
      score: Math.round((matchedWeight / totalWeight) * 100),
      signals,
    };
  }

  private addSignal(
    signals: ScoreSignal[],
    key: string,
    weight: number | undefined,
    matched: boolean | null,
  ): void {
    if (!weight || matched === null) return;
    signals.push({ key, matched, weight });
  }

  private inRange(value: unknown, range: unknown): boolean | null {
    const numericValue = Number(value);
    const rangeValue = range as { min?: number; max?: number } | undefined;

    if (!rangeValue || Number.isNaN(numericValue)) return null;

    return (
      numericValue >= Number(rangeValue.min ?? Number.MIN_SAFE_INTEGER) &&
      numericValue <= Number(rangeValue.max ?? Number.MAX_SAFE_INTEGER)
    );
  }

  private inList(value: unknown, list: unknown): boolean | null {
    const values = Array.isArray(list) ? list.filter(Boolean) : [];
    if (values.length === 0 || value === undefined || value === null)
      return null;
    return values.includes(value);
  }

  private locationMatches(
    profile: ProfileLike,
    filters: Record<string, unknown> | undefined,
  ): boolean | null {
    if (!filters) return null;
    return (
      this.inList(this.get(profile, 'personal.city'), filters.city) ??
      this.inList(this.get(profile, 'personal.state'), filters.state) ??
      this.inList(this.get(profile, 'personal.country'), filters.country)
    );
  }

  private lifestyleMatches(
    profile: ProfileLike,
    filters: Record<string, unknown> | undefined,
  ): boolean | null {
    if (!filters) return null;

    const checks = [
      this.inList(this.get(profile, 'personal.smoking'), filters.smoking),
      this.inList(this.get(profile, 'personal.drinking'), filters.drinking),
      this.inList(this.get(profile, 'personal.eating'), filters.eating),
    ].filter((value): value is boolean => value !== null);

    if (checks.length === 0) return null;
    return checks.filter(Boolean).length / checks.length >= 0.5;
  }

  private get(source: unknown, path: string): unknown {
    return path.split('.').reduce<unknown>((current, key) => {
      if (!current || typeof current !== 'object') return undefined;
      return (current as Record<string, unknown>)[key];
    }, source);
  }
}
