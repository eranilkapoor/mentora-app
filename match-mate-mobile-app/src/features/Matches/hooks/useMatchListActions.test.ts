import { Alert } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';
import { useMatchListActions } from './useMatchListActions';
import type { MatchItem } from '../MatchList.types';

const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();
const mockShowConfirm = jest.fn();
const mockT = jest.fn((key: string) => key);

const mockSendInterest = jest.fn();
const mockWithdrawInterest = jest.fn();
const mockShortlistProfile = jest.fn();
const mockRemoveShortlistedProfile = jest.fn();
const mockRespondToInterest = jest.fn();
const mockCreateDirectRoom = jest.fn();
const mockDismissCuratedMatch = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => mockT(key),
  }),
}));

jest.mock('@/core/utils/toast', () => ({
  showSuccess: (payload: unknown) => mockShowSuccess(payload),
  showError: (payload: unknown) => mockShowError(payload),
}));

jest.mock('@/core/utils/confirm', () => ({
  showConfirm: (payload: unknown) => mockShowConfirm(payload),
}));

jest.mock('@/store/services/matchApi.service', () => ({
  useSendInterestMutation: () => [mockSendInterest],
  useWithdrawInterestMutation: () => [mockWithdrawInterest],
  useShortlistProfileMutation: () => [mockShortlistProfile],
  useRemoveShortlistedProfileMutation: () => [mockRemoveShortlistedProfile],
  useRespondToInterestMutation: () => [mockRespondToInterest],
  useDismissCuratedMatchMutation: () => [mockDismissCuratedMatch],
}));

jest.mock('@/store/services/chatApi.service', () => ({
  useCreateDirectRoomMutation: () => [mockCreateDirectRoom],
}));

describe('useMatchListActions', () => {
  const navigation = {
    navigate: jest.fn(),
  };

  const item = (overrides: Partial<MatchItem> = {}): MatchItem => ({
    id: 'user-2',
    name: 'Riya',
    age: 26,
    height: '5\'6"',
    religion: 'Hindu',
    caste: 'Any',
    education: 'Graduate',
    profession: 'Engineer',
    location: 'Mumbai',
    avatarUrl: 'https://cdn.example/avatar.jpg',
    isOnline: true,
    isNew: false,
    isMatched: false,
    isShortlisted: false,
    isInterestPending: false,
    shouldBlurPhoto: false,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

    mockSendInterest.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({}),
    });
    mockWithdrawInterest.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({}),
    });
    mockShortlistProfile.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({}),
    });
    mockRemoveShortlistedProfile.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({}),
    });
    mockRespondToInterest.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({}),
    });
    mockCreateDirectRoom.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({}),
    });
    mockDismissCuratedMatch.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({}),
    });
  });

  it('sends and withdraws interests from primary action flow', async () => {
    const { result } = await renderHook(() =>
      useMatchListActions(navigation as never)
    );

    await act(async () => {
      await result.current.handlePrimaryAction(item());
    });
    expect(mockSendInterest).toHaveBeenCalledWith({ receiverId: 'user-2' });
    expect(mockShowSuccess).toHaveBeenCalled();

    await act(async () => {
      await result.current.handlePrimaryAction(
        item({ isInterestPending: true, interestId: 'interest-1' })
      );
    });
    expect(mockWithdrawInterest).toHaveBeenCalledWith({
      interestId: 'interest-1',
    });
  });

  it('handles shortlist add and remove flows', async () => {
    const { result } = await renderHook(() =>
      useMatchListActions(navigation as never)
    );

    await act(async () => {
      await result.current.handleShortlist(item({ isShortlisted: false }));
    });
    expect(mockShortlistProfile).toHaveBeenCalledWith({ userId: 'user-2' });

    await act(async () => {
      await result.current.handleShortlist(item({ isShortlisted: true }));
    });
    expect(mockRemoveShortlistedProfile).toHaveBeenCalledWith({
      userId: 'user-2',
    });
  });

  it('opens chat for matched profiles and accepts incoming requests', async () => {
    const onInterestAccepted = jest.fn();
    const { result } = await renderHook(() =>
      useMatchListActions(navigation as never, { onInterestAccepted })
    );

    await act(async () => {
      await result.current.handlePrimaryAction(item({ isMatched: true }));
    });
    expect(mockCreateDirectRoom).toHaveBeenCalledWith({
      targetUserId: 'user-2',
    });
    expect(navigation.navigate).toHaveBeenCalledWith('ChatDetails', {
      userId: 'user-2',
      partnerName: 'Riya',
      partnerPhoto: 'https://cdn.example/avatar.jpg',
    });

    await act(async () => {
      await result.current.handlePrimaryAction(
        item({ requestStatus: 'pending', interestId: 'interest-2' })
      );
    });

    expect(mockShowConfirm).toHaveBeenCalled();
    expect(mockRespondToInterest).not.toHaveBeenCalled();

    type ConfirmPayload = {
      onConfirm?: () => Promise<void>;
    };

    const getLastConfirmPayload = (
      mockFn: jest.Mock<void, [ConfirmPayload]>
    ): ConfirmPayload | undefined => {
      const calls = mockFn.mock.calls;
      const lastCall = calls[calls.length - 1];

      return lastCall?.[0];
    };

    const confirmPayload = getLastConfirmPayload(mockShowConfirm);

    await act(async () => {
      await confirmPayload?.onConfirm?.();
    });

    expect(mockRespondToInterest).toHaveBeenCalledWith({
      interestId: 'interest-2',
      action: 'ACCEPT',
    });
    expect(onInterestAccepted).toHaveBeenCalled();
  });

  it('confirms before rejecting incoming requests', async () => {
    const { result } = await renderHook(() =>
      useMatchListActions(navigation as never)
    );

    await act(async () => {
      await result.current.handleRejectRequest(
        item({ requestStatus: 'pending', interestId: 'interest-9' })
      );
    });

    expect(mockShowConfirm).toHaveBeenCalled();
    expect(mockRespondToInterest).not.toHaveBeenCalledWith({
      interestId: 'interest-9',
      action: 'REJECT',
    });

    type ConfirmPayload = {
      onConfirm?: () => Promise<void>;
    };

    const getLastConfirmPayload = (
      mockFn: jest.Mock<void, [ConfirmPayload]>
    ): ConfirmPayload | undefined => {
      const calls = mockFn.mock.calls;
      const lastCall = calls[calls.length - 1];

      return lastCall?.[0];
    };

    const confirmPayload = getLastConfirmPayload(mockShowConfirm);

    await act(async () => {
      await confirmPayload?.onConfirm?.();
    });

    expect(mockRespondToInterest).toHaveBeenCalledWith({
      interestId: 'interest-9',
      action: 'REJECT',
    });
  });
});
