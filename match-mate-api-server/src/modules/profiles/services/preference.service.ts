import { Injectable, Inject } from '@nestjs/common';
import { PreferenceRepository } from '../repositories/preference.repository';
import {
  PartnerFiltersDto,
  MatchSettingsDto,
  MatchWeightsDto,
  UpdatePreferenceDto,
} from '../dto/preference.dto';
import type { ICacheService } from '@/common/cache/interfaces/cache.interface';
import { CACHE_SERVICE } from '@/common/cache/cache.constants';
import { ChildPreference, Religion, ResidencyPreference } from '@/common/enums';
import {
  PartnerFilters,
  Preference,
} from '../schemas/preference/preference.schema';
import { ErrorCode } from '@/common/constants';
import {
  throwBadRequest,
  throwConflict,
} from '@/common/exceptions/throw-app-exception';
import { AppException } from '@/common/exceptions/app.exception';

const WEIGHTS_TOTAL = 100;
@Injectable()
export class PreferenceService {
  constructor(
    private readonly preferenceRepo: PreferenceRepository,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
  ) {}

  //  Create

  async createPreference(userId: string, dto?: UpdatePreferenceDto) {
    try {
      const existing = await this.preferenceRepo.findByUserId(userId);
      if (existing) {
        return throwConflict(ErrorCode.INVALID_REQUEST, {
          reason: 'preferences_already_exist',
        });
      }

      const mergedFilters: PartnerFilters = this.sanitizeReligiousFilters({
        childPreference:
          dto?.filters?.childPreference ?? ChildPreference.DOES_NOT_MATTER,
        residencyPreference:
          dto?.filters?.residencyPreference ??
          ResidencyPreference.DOES_NOT_MATTER,
        ...(dto?.filters ?? {}),
      });

      const mergedWeights = {
        age: 10,
        height: 10,
        religion: 15,
        caste: 10,
        location: 10,
        education: 10,
        occupation: 10,
        lifestyle: 10,
        horoscope: 15,
        ...(dto?.weights ?? {}),
      };

      if (dto?.weights) {
        const total = Object.values(mergedWeights).reduce<number>(
          (sum, val) => sum + (typeof val === 'number' ? val : 0),
          0,
        );
        if (total !== WEIGHTS_TOTAL) {
          return throwBadRequest(ErrorCode.PREFERENCES_INVALID_RANGE, {
            reason: 'invalid_weights_total',
            expected: WEIGHTS_TOTAL,
            received: total,
          });
        }
      }

      const payload: Partial<Preference> = {
        filters: mergedFilters,
        settings: {
          isStrict: false,
          allowPartialMatches: true,
          horoscopeRequired: false,
          profileVerificationRequired: false,
          minimumMatchScore: 50,
          ...(dto?.settings ?? {}),
        },
        weights: mergedWeights,
        aboutPartner: dto?.aboutPartner ?? '',
      };

      const result = await this.preferenceRepo.upsert(userId, payload);
      await this.invalidateCache(userId);

      return result;
    } catch (error) {
      if (error instanceof AppException) throw error;
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'failed_to_create_preferences',
      });
    }
  }

  //  Read

  async getMyPreference(userId: string) {
    try {
      const cacheKey = `preference:${userId}`;
      const cached = await this.cache.get<unknown>(cacheKey);
      if (cached) return cached;

      // Return defaults inline if not yet created  consistent with DEFAULT_* above
      const preference = (await this.preferenceRepo.findByUserId(userId)) ?? {
        filters: {
          childPreference: ChildPreference.DOES_NOT_MATTER,
          residencyPreference: ResidencyPreference.DOES_NOT_MATTER,
        },
        settings: {
          isStrict: false,
          allowPartialMatches: true,
          horoscopeRequired: false,
          profileVerificationRequired: false,
          minimumMatchScore: 50,
        },
        weights: {
          age: 10,
          height: 10,
          religion: 15,
          caste: 10,
          location: 10,
          education: 10,
          occupation: 10,
          lifestyle: 10,
          horoscope: 15,
        },
        aboutPartner: '',
      };

      await this.cache.set(cacheKey, preference, 300);
      return preference;
    } catch (error) {
      if (error instanceof AppException) throw error;
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'failed_to_retrieve_preferences',
      });
    }
  }

  //  Filters

  async updateFilters(userId: string, dto: PartnerFiltersDto) {
    try {
      const result = await this.preferenceRepo.updateFilters(
        userId,
        this.sanitizeReligiousFilters(dto),
      );
      await this.invalidateCache(userId);
      return result;
    } catch (error) {
      if (error instanceof AppException) throw error;
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'failed_to_update_preference_filters',
      });
    }
  }

  //  Settings

  async updateSettings(userId: string, dto: MatchSettingsDto) {
    try {
      const result = await this.preferenceRepo.updateSettings(userId, dto);
      await this.invalidateCache(userId);
      return result;
    } catch (error) {
      if (error instanceof AppException) throw error;
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'failed_to_update_preference_settings',
      });
    }
  }

  //  Weights

  async updateWeights(userId: string, dto: MatchWeightsDto) {
    try {
      const total = Object.values(dto).reduce<number>(
        (sum, val) => sum + (typeof val === 'number' ? val : 0),
        0,
      );

      if (total !== WEIGHTS_TOTAL) {
        return throwBadRequest(ErrorCode.PREFERENCES_INVALID_RANGE, {
          reason: 'invalid_weights_total',
          expected: WEIGHTS_TOTAL,
          received: total,
        });
      }

      const result = await this.preferenceRepo.updateWeights(userId, dto);
      await this.invalidateCache(userId);
      return result;
    } catch (error) {
      if (error instanceof AppException) throw error;
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'failed_to_update_preference_weights',
      });
    }
  }

  //  About Partner

  async updateAboutPartner(userId: string, aboutPartner: string) {
    try {
      const result = await this.preferenceRepo.updateAboutPartner(
        userId,
        aboutPartner,
      );
      await this.invalidateCache(userId);
      return result;
    } catch (error) {
      if (error instanceof AppException) throw error;
      return throwBadRequest(ErrorCode.INVALID_REQUEST, {
        reason: 'failed_to_update_about_partner',
      });
    }
  }

  //  Private

  private async invalidateCache(userId: string): Promise<void> {
    await this.cache.del(`preference:${userId}`);
  }

  private sanitizeReligiousFilters<
    T extends PartnerFiltersDto | PartnerFilters,
  >(filters: T): T {
    const next = { ...filters };
    const religions = Array.isArray(next.religion) ? next.religion : [];

    if (religions.length > 0 && !religions.includes(Religion.HINDU)) {
      next.caste = [];
      next.subCaste = [];
      next.manglikStatus = [];
    }

    return next;
  }
}
