import { validate } from 'class-validator';
import { Status } from '@/common/enums';
import { UpdateUserStatusDto } from './update-user-status.dto';

const createDto = (values: Partial<UpdateUserStatusDto>) =>
  Object.assign(new UpdateUserStatusDto(), {
    userId: '507f1f77bcf86cd799439011',
    ...values,
  });

describe('UpdateUserStatusDto', () => {
  it.each([{ isBlocked: false }, { isBlocked: true }])(
    'accepts a legacy blocked-state update containing %p',
    async (values) => {
      await expect(validate(createDto(values))).resolves.toHaveLength(0);
    },
  );

  it.each([Status.ACTIVE, Status.BLOCKED, Status.SUSPENDED])(
    'accepts an explicit status update containing %s',
    async (status) => {
      await expect(validate(createDto({ status }))).resolves.toHaveLength(0);
    },
  );

  it('rejects unsupported status values', async () => {
    const errors = await validate(
      createDto({ status: 'archived' as UpdateUserStatusDto['status'] }),
    );
    const statusError = errors.find(({ property }) => property === 'status');

    expect(statusError?.constraints?.isEnum).toBeDefined();
  });
});
