import { BadRequestException } from '@nestjs/common';
import { AgePolicyService } from './age-policy.service';

describe('AgePolicyService', () => {
  const service = new AgePolicyService();
  const now = new Date('2026-07-26T00:00:00.000Z');

  it('classifies adult students as self-registerable', () => {
    expect(service.evaluate(new Date('2006-07-26'), now)).toEqual({
      age: 20,
      ageCategory: 'adult',
      parentConsentRequired: false,
      canSelfRegister: true,
      defaultExternalLinksEnabled: true,
      defaultContentRestrictionLevel: 'standard',
    });
  });

  it('requires parent approval for minors', () => {
    expect(service.evaluate(new Date('2012-07-26'), now)).toMatchObject({
      age: 14,
      ageCategory: 'minor',
      parentConsentRequired: true,
      canSelfRegister: false,
      defaultExternalLinksEnabled: false,
      defaultContentRestrictionLevel: 'age_appropriate',
    });
  });

  it('blocks independent registration for minors', () => {
    expect(() => service.assertCanSelfRegister(new Date('2014-01-01'))).toThrow(
      BadRequestException,
    );
  });

  it('rejects impossible student ages', () => {
    expect(() => service.evaluate(new Date('2028-01-01'), now)).toThrow(
      BadRequestException,
    );
    expect(() => service.evaluate(new Date('2024-01-01'), now)).toThrow(
      BadRequestException,
    );
  });
});
