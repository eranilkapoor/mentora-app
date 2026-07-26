import { BadRequestException, Injectable } from '@nestjs/common';

export type StudentAgeCategory = 'minor' | 'adult';

export interface AgePolicyResult {
  age: number;
  ageCategory: StudentAgeCategory;
  parentConsentRequired: boolean;
  canSelfRegister: boolean;
  defaultExternalLinksEnabled: boolean;
  defaultContentRestrictionLevel: 'age_appropriate' | 'standard';
}

@Injectable()
export class AgePolicyService {
  evaluate(dateOfBirth: Date, now = new Date()): AgePolicyResult {
    if (Number.isNaN(dateOfBirth.getTime()) || dateOfBirth >= now) {
      throw new BadRequestException('A valid past date of birth is required');
    }

    const age = this.getAge(dateOfBirth, now);
    if (age < 4 || age > 100) {
      throw new BadRequestException(
        'Student age must be between 4 and 100 years',
      );
    }

    const ageCategory: StudentAgeCategory = age >= 18 ? 'adult' : 'minor';

    return {
      age,
      ageCategory,
      parentConsentRequired: ageCategory === 'minor',
      canSelfRegister: ageCategory === 'adult',
      defaultExternalLinksEnabled: ageCategory === 'adult',
      defaultContentRestrictionLevel:
        ageCategory === 'minor' ? 'age_appropriate' : 'standard',
    };
  }

  assertCanSelfRegister(dateOfBirth: Date) {
    const policy = this.evaluate(dateOfBirth);
    if (!policy.canSelfRegister) {
      throw new BadRequestException(
        'Students under 18 must be created or approved by a parent or guardian',
      );
    }
    return policy;
  }

  private getAge(dateOfBirth: Date, now: Date): number {
    let age = now.getFullYear() - dateOfBirth.getFullYear();
    const monthDelta = now.getMonth() - dateOfBirth.getMonth();
    if (
      monthDelta < 0 ||
      (monthDelta === 0 && now.getDate() < dateOfBirth.getDate())
    ) {
      age -= 1;
    }
    return age;
  }
}
