import { KycController } from './kyc.controller';
import { SuccessCode } from '@/common/constants';

describe('KycController', () => {
  const userId = 'user-1';
  const req = { user: { sub: userId } } as never;
  const service = {
    getMyStatus: jest.fn(),
    submitManual: jest.fn(),
    initiateEkyc: jest.fn(),
  };

  let controller: KycController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new KycController(service as never);
  });

  it('fetches verification status for the current user', async () => {
    service.getMyStatus.mockResolvedValue({ status: 'pending' });

    const response = await controller.getMyStatus(req);

    expect(service.getMyStatus).toHaveBeenCalledWith(userId);
    expect(response.code).toBe(SuccessCode.PROFILE_FETCHED);
  });

  it('submits manual KYC files and initiates eKYC', async () => {
    const files = { idProof: [], selfie: [] };
    const manualDto = { documentType: 'aadhaar' } as never;
    const ekycDto = { provider: 'digilocker' } as never;
    service.submitManual.mockResolvedValue({ status: 'submitted' });
    service.initiateEkyc.mockResolvedValue({ redirectUrl: 'https://kyc.test' });

    const submitted = await controller.submitManual(req, manualDto, files);
    const initiated = await controller.initiateEkyc(req, ekycDto);

    expect(service.submitManual).toHaveBeenCalledWith(userId, manualDto, files);
    expect(service.initiateEkyc).toHaveBeenCalledWith(userId, ekycDto);
    expect(submitted.code).toBe(SuccessCode.PROFILE_UPDATED);
    expect(initiated.code).toBe(SuccessCode.PROFILE_UPDATED);
  });
});
