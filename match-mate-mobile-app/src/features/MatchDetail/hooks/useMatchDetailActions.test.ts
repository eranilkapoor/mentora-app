import { act, renderHook } from '@testing-library/react-native';
import { useMatchDetailActions } from './useMatchDetailActions';

const mockRefetch = jest.fn();
const mockSendInterest = jest.fn();
const mockWithdrawInterest = jest.fn();
const mockCreateDirectRoom = jest.fn();
const mockBlockUser = jest.fn();
const mockReportUser = jest.fn();
const mockShowConfirm = jest.fn();
const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();
const mockShowUpgradePrompt = jest.fn();

type ConfirmPayload = {
  onConfirm: () => void | Promise<void>;
};

const confirmAt = (index: number): ConfirmPayload => {
  const call = (mockShowConfirm.mock.calls as Array<[ConfirmPayload]>)[index];
  if (!call) {
    throw new Error(`Missing confirm call at index ${index}`);
  }
  return call[0];
};

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) =>
      options?.defaultValue ?? key,
  }),
}));

jest.mock('@/core/utils/confirm', () => ({
  showConfirm: (payload: unknown) => mockShowConfirm(payload),
}));

jest.mock('@/core/utils/toast', () => ({
  showSuccess: (payload: unknown) => mockShowSuccess(payload),
  showError: (payload: unknown) => mockShowError(payload),
}));

jest.mock('@/core/utils/apiMessage', () => ({
  isPlanAccessError: (error: unknown) =>
    Boolean((error as { status?: number })?.status === 402),
}));

jest.mock('@/features/Membership/hooks/useUpgradePrompt', () => ({
  useUpgradePrompt: () => mockShowUpgradePrompt,
}));

jest.mock('@/store/services/matchApi.service', () => ({
  useGetMatchProfileQuery: () => ({ refetch: mockRefetch }),
  useSendInterestMutation: () => [mockSendInterest, { isLoading: false }],
  useWithdrawInterestMutation: () => [
    mockWithdrawInterest,
    { isLoading: false },
  ],
}));

jest.mock('@/store/services/chatApi.service', () => ({
  useCreateDirectRoomMutation: () => [
    mockCreateDirectRoom,
    { isLoading: false },
  ],
}));

jest.mock('@/store/services/privacySettingsApi.service', () => ({
  useBlockUserMutation: () => [mockBlockUser, { isLoading: false }],
  useReportUserMutation: () => [mockReportUser, { isLoading: false }],
}));

describe('useMatchDetailActions', () => {
  const navigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRefetch.mockResolvedValue({});
    for (const fn of [
      mockSendInterest,
      mockWithdrawInterest,
      mockCreateDirectRoom,
      mockBlockUser,
      mockReportUser,
    ]) {
      fn.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
    }
  });

  it('sends and withdraws interest with optimistic state', async () => {
    const { result } = await renderHook(() =>
      useMatchDetailActions(
        'user-2',
        'Riya',
        ['https://cdn.example.com/riya.jpg'],
        navigation as never
      )
    );

    await act(async () => {
      await result.current.handleSendInterest();
    });

    expect(mockSendInterest).toHaveBeenCalledWith({ receiverId: 'user-2' });
    expect(result.current.optimisticPendingInterest).toBe(true);
    expect(mockRefetch).toHaveBeenCalled();

    await act(async () => {
      await result.current.handleWithdrawInterest('interest-1');
    });

    expect(mockWithdrawInterest).toHaveBeenCalledWith({
      interestId: 'interest-1',
    });
    expect(result.current.optimisticPendingInterest).toBe(false);

    await act(async () => {
      result.current.resetOptimistic();
      await result.current.handleWithdrawInterest();
    });

    expect(mockWithdrawInterest).toHaveBeenCalledTimes(1);
  });

  it('opens chat and shows upgrade prompt on plan access errors', async () => {
    const { result } = await renderHook(() =>
      useMatchDetailActions(
        'user-2',
        'Riya',
        ['https://cdn.example.com/riya.jpg'],
        navigation as never
      )
    );

    await act(async () => {
      await result.current.handleOpenChat('Hello');
    });

    expect(mockCreateDirectRoom).toHaveBeenCalledWith({
      targetUserId: 'user-2',
      initialMessage: 'Hello',
    });
    expect(navigation.navigate).toHaveBeenCalledWith('ChatDetails', {
      userId: 'user-2',
      partnerName: 'Riya',
      partnerPhoto: 'https://cdn.example.com/riya.jpg',
    });

    mockCreateDirectRoom.mockReturnValueOnce({
      unwrap: jest.fn().mockRejectedValue({ status: 402 }),
    });

    await act(async () => {
      await result.current.handleOpenChat();
    });

    expect(mockShowUpgradePrompt).toHaveBeenCalledWith(
      'match_detail.action_chat'
    );
  });

  it('confirms report and block actions', async () => {
    const { result } = await renderHook(() =>
      useMatchDetailActions('user-2', 'Riya', [], navigation as never)
    );

    await act(async () => {
      result.current.handleReport();
    });

    expect(mockShowConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'match_detail.report_title',
        destructive: true,
      })
    );

    await act(async () => {
      await confirmAt(0).onConfirm();
    });

    expect(mockReportUser).toHaveBeenCalledWith({
      targetUserId: 'user-2',
      reason: 'Reported from match details',
    });
    expect(mockShowSuccess).toHaveBeenCalledWith({
      title: 'match_detail.report_success_title',
      message: 'match_detail.report_success_message',
    });

    await act(async () => {
      result.current.handleBlock();
    });
    await act(async () => {
      await confirmAt(1).onConfirm();
    });

    expect(mockBlockUser).toHaveBeenCalledWith({ targetUserId: 'user-2' });
    expect(navigation.goBack).toHaveBeenCalled();
  });

  it('surfaces failures for interest, chat, report, and block actions', async () => {
    mockSendInterest.mockReturnValueOnce({
      unwrap: jest.fn().mockRejectedValue(new Error('send failed')),
    });
    mockCreateDirectRoom.mockReturnValueOnce({
      unwrap: jest.fn().mockRejectedValue(new Error('chat failed')),
    });
    mockReportUser.mockReturnValueOnce({
      unwrap: jest.fn().mockRejectedValue(new Error('report failed')),
    });
    mockBlockUser.mockReturnValueOnce({
      unwrap: jest.fn().mockRejectedValue(new Error('block failed')),
    });

    const { result } = await renderHook(() =>
      useMatchDetailActions('user-2', 'Riya', [], navigation as never)
    );

    await act(async () => {
      await result.current.handleSendInterest();
      await result.current.handleOpenChat();
      result.current.handleReport();
    });
    await act(async () => {
      await confirmAt(0).onConfirm();
      result.current.handleBlock();
    });
    await act(async () => {
      await confirmAt(1).onConfirm();
    });

    expect(mockShowError).toHaveBeenCalledWith({
      title: 'match_detail.interest_failed_title',
      message: 'common.try_again',
    });
    expect(mockShowError).toHaveBeenCalledWith({
      title: 'match_detail.chat_unavailable_title',
      message: 'common.try_again',
    });
    expect(mockShowError).toHaveBeenCalledWith({
      title: 'match_detail.report_failed_title',
      message: 'common.try_again',
    });
    expect(mockShowError).toHaveBeenCalledWith({
      title: 'match_detail.block_failed_title',
      message: 'common.try_again',
    });
  });
});
