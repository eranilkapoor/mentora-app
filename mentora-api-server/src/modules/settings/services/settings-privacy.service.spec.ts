import { ErrorCode } from '@/common/constants';
import { SettingsService } from './settings.service';

describe('SettingsService privacy boundaries', () => {
  const service = Object.create(SettingsService.prototype) as SettingsService;

  it('does not allow users to block themselves', async () => {
    await expect(
      service.blockUser('same-user', { targetUserId: 'same-user' }),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_REQUEST });
  });

  it('does not allow users to report themselves', async () => {
    await expect(
      service.reportUser('same-user', {
        targetUserId: 'same-user',
        reason: 'invalid',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_REQUEST });
  });

  it('does not allow users to hide themselves', async () => {
    await expect(
      service.hideProfile('same-user', {
        targetUserId: 'same-user',
        reason: 'invalid',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.INVALID_REQUEST });
  });
});
