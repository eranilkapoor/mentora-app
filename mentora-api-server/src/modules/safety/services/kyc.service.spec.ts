/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { AppException } from '@/common/exceptions/app.exception';
import type { StorageService } from '@/modules/storage/services/storage.service';
import {
  VerificationProvider,
  VerificationStatus,
} from '../enums/verification.enums';
import type { VerificationDocument } from '../schemas/verification.schema';
import { KycService } from './kyc.service';

describe('KycService', () => {
  const findOneAndUpdate = jest.fn();
  const queueExec = jest.fn();
  const find = jest.fn(() => ({
    sort: jest.fn(() => ({
      limit: jest.fn(() => ({ lean: jest.fn(() => ({ exec: queueExec })) })),
    })),
  }));
  const model = {
    findOneAndUpdate,
    find,
  } as unknown as Model<VerificationDocument>;
  const storage = { uploadFile: jest.fn() };
  let service: KycService;

  const file = (name: string) =>
    ({
      originalname: name,
      mimetype: 'image/jpeg',
      buffer: Buffer.from([0xff, 0xd8, 0xff, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    }) as Express.Multer.File;

  beforeEach(() => {
    jest.clearAllMocks();
    findOneAndUpdate.mockResolvedValue({ status: VerificationStatus.PENDING });
    storage.uploadFile.mockReset();
    storage.uploadFile
      .mockResolvedValueOnce({ url: 'id-proof.jpg' })
      .mockResolvedValueOnce({ url: 'selfie.jpg' });
    service = new KycService(model, storage as unknown as StorageService);
  });

  it('gets or creates canonical verification status', async () => {
    const userId = new Types.ObjectId().toString();
    await service.getMyStatus(userId);

    expect(findOneAndUpdate).toHaveBeenCalledWith(
      { userId: new Types.ObjectId(userId) },
      {
        $setOnInsert: {
          userId: new Types.ObjectId(userId),
          status: VerificationStatus.NOT_STARTED,
          provider: VerificationProvider.MANUAL,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  });

  it.each([
    [{ selfie: [file('selfie.jpg')] }],
    [{ idProof: [file('id.jpg')] }],
    [{ idProof: [], selfie: [] }],
  ])('requires both manual verification files', async (files) => {
    await expect(
      service.submitManual(new Types.ObjectId().toString(), {}, files),
    ).rejects.toBeInstanceOf(AppException);
  });

  it.each([
    [undefined, 'identity_document'],
    ['passport', 'passport'],
  ])(
    'uploads manual evidence with document type %s',
    async (documentType, expected) => {
      const userId = new Types.ObjectId().toString();
      await service.submitManual(
        userId,
        { documentType },
        { idProof: [file('id.jpg')], selfie: [file('selfie.jpg')] },
      );

      expect(storage.uploadFile).toHaveBeenCalledTimes(2);
      expect(findOneAndUpdate).toHaveBeenCalledWith(
        { userId: new Types.ObjectId(userId) },
        expect.objectContaining({
          $set: expect.objectContaining({
            idProofUrl: 'id-proof.jpg',
            selfieUrl: 'selfie.jpg',
            documentType: expected,
            provider: VerificationProvider.MANUAL,
            status: VerificationStatus.PENDING,
          }),
        }),
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    },
  );

  it('initiates provider-backed eKYC', async () => {
    const userId = new Types.ObjectId().toString();
    await service.initiateEkyc(userId, {
      provider: VerificationProvider.DIGILOCKER,
      consentReference: 'consent-id',
    });

    expect(findOneAndUpdate).toHaveBeenCalledWith(
      { userId: new Types.ObjectId(userId) },
      expect.objectContaining({
        $set: expect.objectContaining({
          provider: VerificationProvider.DIGILOCKER,
          providerPayload: {
            consentReference: 'consent-id',
            integrationStatus: 'provider_credentials_required',
          },
        }),
      }),
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  });

  it('lists default and explicitly filtered review queues', async () => {
    queueExec.mockResolvedValue([{ status: VerificationStatus.PENDING }]);
    await service.getReviewQueue();
    expect(find).toHaveBeenLastCalledWith({
      status: VerificationStatus.PENDING,
    });

    await service.getReviewQueue(VerificationStatus.REJECTED);
    expect(find).toHaveBeenLastCalledWith({
      status: VerificationStatus.REJECTED,
    });
  });

  it.each([
    [VerificationStatus.APPROVED, undefined, expect.any(Date), undefined],
    [VerificationStatus.REJECTED, 'Mismatch', undefined, 'Mismatch'],
  ])(
    'records %s review decisions',
    async (status, rejectionReason, verifiedAt, expectedReason) => {
      const userId = new Types.ObjectId().toString();
      const reviewerId = new Types.ObjectId().toString();
      findOneAndUpdate.mockResolvedValue({ status });

      await expect(
        service.review(userId, reviewerId, {
          status,
          rejectionReason,
        } as never),
      ).resolves.toEqual({ status });
      expect(findOneAndUpdate).toHaveBeenCalledWith(
        { userId: new Types.ObjectId(userId) },
        {
          $set: {
            status,
            verifiedAt,
            rejectionReason: expectedReason,
            reviewedBy: new Types.ObjectId(reviewerId),
            reviewedAt: expect.any(Date),
          },
        },
        { new: true },
      );
    },
  );

  it('rejects review of a missing verification', async () => {
    findOneAndUpdate.mockResolvedValue(null);
    await expect(
      service.review(
        new Types.ObjectId().toString(),
        new Types.ObjectId().toString(),
        { status: VerificationStatus.APPROVED },
      ),
    ).rejects.toBeInstanceOf(AppException);
  });
});
