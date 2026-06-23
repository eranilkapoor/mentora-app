import { WalletController } from './wallet.controller';
import { SuccessCode } from '@/common/constants';

describe('WalletController', () => {
  const userId = 'user-1';
  const req = { user: { sub: userId } } as never;
  const service = {
    getSummary: jest.fn(),
    spend: jest.fn(),
  };

  let controller: WalletController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new WalletController(service as never);
  });

  it('fetches wallet summary and spends coins for the current user', async () => {
    const dto = {
      coins: 20,
      referenceId: 'boost-1',
      reason: 'profile_boost',
      metadata: { source: 'test' },
    };
    service.getSummary.mockResolvedValue({ coins: 50 });
    service.spend.mockResolvedValue({ coins: 30 });

    const summary = await controller.getWallet(req);
    const spend = await controller.spendWallet(req, dto);

    expect(service.getSummary).toHaveBeenCalledWith(userId);
    expect(service.spend).toHaveBeenCalledWith({
      userId,
      coins: 20,
      referenceId: 'boost-1',
      reason: 'profile_boost',
      metadata: { source: 'test' },
    });
    expect(summary.code).toBe(SuccessCode.WALLET_FETCHED);
    expect(spend.code).toBe(SuccessCode.WALLET_FETCHED);
  });
});
