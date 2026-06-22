import { validate } from 'class-validator';
import { UpdateUserStatusDto } from './update-user-status.dto';

const createDto = (values: Partial<UpdateUserStatusDto>) =>
  Object.assign(new UpdateUserStatusDto(), {
    userId: '507f1f77bcf86cd799439011',
    ...values,
  });

describe('UpdateUserStatusDto', () => {
  it.each([{ isBlocked: false }, { isVerified: true }])(
    'accepts a status update containing %p',
    async (values) => {
      await expect(validate(createDto(values))).resolves.toHaveLength(0);
    },
  );

  it('rejects requests without a status field', async () => {
    const errors = await validate(createDto({ reason: 'No status supplied' }));
    const statusSelectionError = errors.find(
      ({ property }) => property === '_statusSelection',
    );

    expect(statusSelectionError?.constraints).toMatchObject({
      atLeastOneUserStatusField:
        'Either isBlocked or isVerified must be provided',
    });
  });
});
