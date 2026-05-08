import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { PreferenceRepository } from '../repositories/preference.repository';
import {
  PartnerFiltersDto,
  MatchSettingsDto,
  MatchWeightsDto,
} from '../dto/preference.dto';
import type { ICacheService } from 'src/modules/cache/interfaces/cache.interface';
import { CACHE_SERVICE } from 'src/modules/cache/interfaces/cache.interface';

const WEIGHTS_TOTAL = 100;

@Injectable()
export class PreferenceService {
  constructor(
    private readonly preferenceRepo: PreferenceRepository,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
  ) {}

  async getMyPreference(userId: string) {
    try {
      const cacheKey = `preference:${userId}`;
      const cached = await this.cache.get<unknown>(cacheKey);
      if (cached) return cached;

      const preference = (await this.preferenceRepo.findByUserId(userId)) ??
        // Return defaults if not yet created
        {
          filters: {},
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
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Failed to retrieve preferences',
      );
    }
  }

  async updateFilters(userId: string, dto: PartnerFiltersDto) {
    try {
      const result = await this.preferenceRepo.updateFilters(userId, dto);
      await this.invalidateCache(userId);
      return result;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to update filters',
      );
    }
  }

  async updateSettings(userId: string, dto: MatchSettingsDto) {
    try {
      const result = await this.preferenceRepo.updateSettings(userId, dto);
      await this.invalidateCache(userId);
      return result;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to update settings',
      );
    }
  }

  async updateWeights(userId: string, dto: MatchWeightsDto) {
    try {
      // Validate total equals 100
      const total = Object.values(dto).reduce<number>(
        (sum, val) => sum + (typeof val === 'number' ? val : 0),
        0,
      );

      if (total !== WEIGHTS_TOTAL) {
        throw new BadRequestException(
          `Match weights must total exactly ${WEIGHTS_TOTAL}. Received: ${total}.`,
        );
      }

      const result = await this.preferenceRepo.updateWeights(userId, dto);
      await this.invalidateCache(userId);
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to update weights',
      );
    }
  }

  async updateAboutPartner(userId: string, aboutPartner: string) {
    try {
      const result = await this.preferenceRepo.updateAboutPartner(
        userId,
        aboutPartner,
      );
      await this.invalidateCache(userId);
      return result;
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Failed to update about partner',
      );
    }
  }

  private async invalidateCache(userId: string) {
    await this.cache.del(`preference:${userId}`);
  }
}
