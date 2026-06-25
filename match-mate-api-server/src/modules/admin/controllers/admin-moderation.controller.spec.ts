import { SuccessCode } from '@/common/constants';
import { ChatModerationStatus } from '@/modules/chat/enums/chat.enums';
import { VerificationStatus } from '@/modules/safety/enums/verification.enums';
import { AdminModerationController } from './admin-moderation.controller';

describe('AdminModerationController', () => {
  const adminService = {
    getModerationQueue: jest.fn(),
  };
  const mediaService = {
    getReviewQueue: jest.fn(),
    reviewMedia: jest.fn(),
  };
  const kycService = {
    getReviewQueue: jest.fn(),
    review: jest.fn(),
  };
  const chatService = {
    getModerationQueue: jest.fn(),
    reviewMessage: jest.fn(),
  };
  const auditService = {
    write: jest.fn(),
  };

  let controller: AdminModerationController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AdminModerationController(
      adminService as never,
      mediaService as never,
      kycService as never,
      chatService as never,
      auditService as never,
    );
  });

  it('gets unified moderation queue', async () => {
    adminService.getModerationQueue.mockResolvedValue({ items: [] });

    const response = await controller.getUnifiedQueue();

    expect(response.code).toBe(SuccessCode.ADMIN_MODERATION_QUEUE_FETCHED);
  });

  it('gets and reviews media queue', async () => {
    mediaService.getReviewQueue.mockResolvedValue([]);
    mediaService.reviewMedia.mockResolvedValue({ _id: 'm1' });
    const req = { user: { sub: 'mod-1' } };

    const queueResponse = await controller.getMediaQueue('50');
    const reviewResponse = await controller.reviewMedia(req as never, 'm1', {
      approve: false,
      note: 'policy',
    });

    expect(mediaService.getReviewQueue).toHaveBeenCalledWith(50);
    expect(mediaService.reviewMedia).toHaveBeenCalledWith(
      'mod-1',
      'm1',
      false,
      'policy',
    );
    expect(queueResponse.code).toBe(SuccessCode.ADMIN_MODERATION_QUEUE_FETCHED);
    expect(reviewResponse.code).toBe(SuccessCode.ADMIN_USER_UPDATED);
    expect(auditService.write).toHaveBeenCalled();
  });

  it('gets and reviews chat moderation queue', async () => {
    chatService.getModerationQueue.mockResolvedValue([]);
    chatService.reviewMessage.mockResolvedValue({ _id: 'msg1' });
    const req = { user: { sub: 'mod-1' } };

    const queueResponse = await controller.getChatModerationQueue(
      ChatModerationStatus.FLAGGED,
      '10',
    );
    const reviewResponse = await controller.reviewChatMessage(
      req as never,
      'msg1',
      {
        approve: true,
      },
    );

    expect(chatService.getModerationQueue).toHaveBeenCalledWith(
      ChatModerationStatus.FLAGGED,
      10,
    );
    expect(chatService.reviewMessage).toHaveBeenCalledWith(
      'mod-1',
      'msg1',
      true,
      undefined,
    );
    expect(queueResponse.code).toBe(SuccessCode.ADMIN_MODERATION_QUEUE_FETCHED);
    expect(reviewResponse.code).toBe(SuccessCode.ADMIN_USER_UPDATED);
  });

  it('gets and reviews kyc queue', async () => {
    kycService.getReviewQueue.mockResolvedValue([]);
    kycService.review.mockResolvedValue({ _id: 'v1' });
    const req = { user: { sub: 'mod-1' } };

    const queueResponse = await controller.getKycQueue(
      VerificationStatus.PENDING,
    );
    const reviewResponse = await controller.reviewKyc(req as never, 'u1', {
      status: VerificationStatus.APPROVED,
    });

    expect(kycService.getReviewQueue).toHaveBeenCalledWith(
      VerificationStatus.PENDING,
    );
    expect(kycService.review).toHaveBeenCalledWith('u1', 'mod-1', {
      status: VerificationStatus.APPROVED,
    });
    expect(queueResponse.code).toBe(SuccessCode.ADMIN_MODERATION_QUEUE_FETCHED);
    expect(reviewResponse.code).toBe(SuccessCode.ADMIN_PROFILE_APPROVED);
  });
});
