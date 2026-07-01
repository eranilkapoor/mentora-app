/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Types } from 'mongoose';
import { SuccessStoryService } from './success-story.service';

describe('SuccessStoryService', () => {
  const storyModel = {
    create: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };
  const auditService = { write: jest.fn() };
  let service: SuccessStoryService;
  let userId: string;
  let reviewerId: string;

  const listChain = (items: unknown[]) => ({
    sort: jest.fn(() => ({
      skip: jest.fn(() => ({
        limit: jest.fn(() => ({
          lean: jest.fn(() => ({
            exec: jest.fn().mockResolvedValue(items),
          })),
        })),
      })),
    })),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    userId = new Types.ObjectId().toString();
    reviewerId = new Types.ObjectId().toString();
    auditService.write.mockResolvedValue({});
    service = new SuccessStoryService(
      storyModel as never,
      auditService as never,
    );
  });

  it('requires publication consent and normalizes submissions', async () => {
    const dto = {
      title: '  Our journey ',
      partnerName: ' Asha ',
      story: ` ${'A'.repeat(100)} `,
      marriageDate: '2026-02-14',
      location: ' Mumbai ',
      publicationConsent: false,
    };
    await expect(service.submit(userId, dto)).rejects.toMatchObject({
      code: 'COMMON.INVALID_REQUEST',
    });

    storyModel.create.mockResolvedValue({ _id: new Types.ObjectId() });
    await service.submit(userId, { ...dto, publicationConsent: true });
    expect(storyModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Our journey',
        partnerName: 'Asha',
        location: 'Mumbai',
        status: 'submitted',
        publicationConsent: true,
      }),
    );
  });

  it('lists only published consented stories with standard pagination', async () => {
    storyModel.find.mockReturnValue(listChain([{ title: 'Published' }]));
    storyModel.countDocuments.mockResolvedValue(21);

    await expect(
      service.listPublished({ page: 2, limit: 20 }),
    ).resolves.toEqual(
      expect.objectContaining({
        items: [{ title: 'Published' }],
        page: 2,
        total: 21,
        totalPages: 2,
        hasNextPage: false,
        hasPrevPage: true,
      }),
    );
    expect(storyModel.find).toHaveBeenCalledWith({
      status: 'published',
      publicationConsent: true,
    });
  });

  it('requires rejection reasons and records publishing decisions', async () => {
    const storyId = new Types.ObjectId().toString();
    await expect(
      service.review(reviewerId, storyId, { status: 'rejected' }),
    ).rejects.toMatchObject({ code: 'COMMON.INVALID_REQUEST' });

    storyModel.findByIdAndUpdate.mockReturnValue({
      lean: () => ({
        exec: jest.fn().mockResolvedValue({ status: 'published' }),
      }),
    });
    await expect(
      service.review(reviewerId, storyId, { status: 'published' }),
    ).resolves.toEqual({ status: 'published' });
    expect(storyModel.findByIdAndUpdate).toHaveBeenCalledWith(
      storyId,
      expect.objectContaining({
        $set: expect.objectContaining({
          status: 'published',
          publishedAt: expect.any(Date),
          reviewedAt: expect.any(Date),
        }),
      }),
      { new: true },
    );
    expect(auditService.write).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'success_story.published',
        targetId: storyId,
      }),
    );
  });

  it('rejects invalid and missing review targets', async () => {
    await expect(
      service.review(reviewerId, 'invalid', { status: 'published' }),
    ).rejects.toBeDefined();
    storyModel.findByIdAndUpdate.mockReturnValue({
      lean: () => ({ exec: jest.fn().mockResolvedValue(null) }),
    });
    await expect(
      service.review(reviewerId, new Types.ObjectId().toString(), {
        status: 'archived',
      }),
    ).rejects.toBeDefined();
  });
});
