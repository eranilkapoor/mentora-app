import { ReferralsController } from './referrals.controller';
import { SuccessCode } from '@/common/constants';

describe('ReferralsController', () => {
  const userId = 'user-1';
  const req = { user: { sub: userId } } as never;

  const service = {
    getMySummary: jest.fn(),
    getWallet: jest.fn(),
    redeemWallet: jest.fn(),
    getLeaderboard: jest.fn(),
  };

  let controller: ReferralsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ReferralsController(service as never);
  });

  it('fetches referral summary and wallet for the current user', async () => {
    service.getMySummary.mockResolvedValue({ code: 'ABCD' });
    service.getWallet.mockResolvedValue({ coins: 100 });

    const summary = await controller.getMyReferrals(req);
    const wallet = await controller.getWallet(req);

    expect(service.getMySummary).toHaveBeenCalledWith(userId);
    expect(service.getWallet).toHaveBeenCalledWith(userId);
    expect(summary.code).toBe(SuccessCode.REFERRALS_FETCHED);
    expect(wallet.code).toBe(SuccessCode.WALLET_FETCHED);
  });

  it('redeems wallet points and defaults leaderboard limit', async () => {
    service.redeemWallet.mockResolvedValue({ redeemed: true });
    service.getLeaderboard.mockResolvedValue([{ userId }]);

    const redeemed = await controller.redeemWallet(req, { points: 50 });
    const defaultBoard = await controller.getLeaderboard();
    const customBoard = await controller.getLeaderboard('10');

    expect(service.redeemWallet).toHaveBeenCalledWith(userId, 50);
    expect(service.getLeaderboard).toHaveBeenNthCalledWith(1, 25);
    expect(service.getLeaderboard).toHaveBeenNthCalledWith(2, 10);
    expect(redeemed.code).toBe(SuccessCode.WALLET_FETCHED);
    expect(defaultBoard.code).toBe(SuccessCode.REFERRALS_FETCHED);
    expect(customBoard.code).toBe(SuccessCode.REFERRALS_FETCHED);
  });
});
