import {
  Injectable,
  BadRequestException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { PreferenceRepository } from '../repositories/preference.repository';
import {
  PartnerFiltersDto,
  MatchSettingsDto,
  MatchWeightsDto,
  UpdatePreferenceDto,
} from '../dto/preference.dto';
import type { ICacheService } from 'src/modules/cache/interfaces/cache.interface';
import { CACHE_SERVICE } from 'src/modules/cache/interfaces/cache.interface';
import { ChildPreference, ResidencyPreference } from 'src/common/enums';
import {
  PartnerFilters,
  Preference,
} from '../schemas/preference/preference.schema';

const WEIGHTS_TOTAL = 100;
@Injectable()
export class PreferenceService {
  constructor(
    private readonly preferenceRepo: PreferenceRepository,
    @Inject(CACHE_SERVICE) private readonly cache: ICacheService,
  ) {}

  // ─── Create ───────────────────────────────────────────────────────────────

  async createPreference(userId: string, dto?: UpdatePreferenceDto) {
    try {
      const existing = await this.preferenceRepo.findByUserId(userId);
      if (existing) {
        throw new ConflictException(
          'Preferences already exist for this user. Use the update endpoints to modify them.',
        );
      }

      const mergedFilters: PartnerFilters = {
        childPreference:
          dto?.filters?.childPreference ?? ChildPreference.DOES_NOT_MATTER,
        residencyPreference:
          dto?.filters?.residencyPreference ??
          ResidencyPreference.DOES_NOT_MATTER,
        ...(dto?.filters ?? {}),
      };

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
          throw new BadRequestException(
            `Match weights must total exactly ${WEIGHTS_TOTAL}. Received: ${total}.`,
          );
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
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to create preferences',
      );
    }
  }

  // ─── Read ─────────────────────────────────────────────────────────────────

  async getMyPreference(userId: string) {
    try {
      const cacheKey = `preference:${userId}`;
      const cached = await this.cache.get<unknown>(cacheKey);
      if (cached) return cached;

      // Return defaults inline if not yet created — consistent with DEFAULT_* above
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
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Failed to retrieve preferences',
      );
    }
  }

  // ─── Filters ──────────────────────────────────────────────────────────────

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

  // ─── Settings ─────────────────────────────────────────────────────────────

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

  // ─── Weights ──────────────────────────────────────────────────────────────

  async updateWeights(userId: string, dto: MatchWeightsDto) {
    try {
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

  // ─── About Partner ────────────────────────────────────────────────────────

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

  // ─── Private ──────────────────────────────────────────────────────────────

  private async invalidateCache(userId: string): Promise<void> {
    await this.cache.del(`preference:${userId}`);
  }
}
