import { Alert } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';
import { useHomeActions } from './useHomeActions';
import type { HomeMatchProfile } from '../Home.types';

const mockSendInterest = jest.fn();
const mockWithdrawInterest = jest.fn();
const mockShortlistProfile = jest.fn();
const mockRemoveShortlistedProfile = jest.fn();
const mockCreateDirectRoom = jest.fn();
const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();
const mockShowUpgradePrompt = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string; name?: string }) =>
      options?.defaultValue ?? key,
  }),
}));

jest.mock('@/core/utils/toast', () => ({
  showSuccess: (payload: unknown) => mockShowSuccess(payload),
  showError: (payload: unknown) => mockShowError(payload),
}));

jest.mock('@/features/Membership/hooks/useUpgradePrompt', () => ({
  useUpgradePrompt: () => mockShowUpgradePrompt,
}));

jest.mock('@/core/utils/apiMessage', () => ({
  isPlanAccessError: (error: unknown) =>
    Boolean((error as { status?: number })?.status === 402),
}));

jest.mock('@/store/services/matchApi.service', () => ({
  useSendInterestMutation: () => [mockSendInterest],
  useWithdrawInterestMutation: () => [mockWithdrawInterest],
  useShortlistProfileMutation: () => [mockShortlistProfile],
  useRemoveShortlistedProfileMutation: () => [mockRemoveShortlistedProfile],
}));

jest.mock('@/store/services/chatApi.service', () => ({
  useCreateDirectRoomMutation: () => [mockCreateDirectRoom],
}));

const match = (
  overrides: Partial<HomeMatchProfile> = {}
): HomeMatchProfile => ({
  userId: 'user-2',
  name: 'Riya',
  age: 28,
  height: '5 ft 7 in',
  location: 'Mumbai',
  religion: 'Hindu',
  education: 'Graduate',
  profession: 'Engineer',
  isOnline: true,
  isNew: false,
  photos: ['https://cdn.example.com/riya.jpg'],
  isMatched: false,
  shouldBlurPhotos: false,
  isShortlisted: false,
  isInterestPending: false,
  ...overrides,
});

describe('useHomeActions', () => {
  const navigation = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    for (const fn of [
      mockSendInterest,
      mockWithdrawInterest,
      mockShortlistProfile,
      mockRemoveShortlistedProfile,
      mockCreateDirectRoom,
    ]) {
      fn.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) });
    }
  });

  it('sends, withdraws, and shortlists profiles', async () => {
    const { result } = await renderHook(() =>
      useHomeActions(navigation as never)
    );

    await act(async () => {
      await result.current.handlePrimaryAction(match());
    });
    expect(mockSendInterest).toHaveBeenCalledWith({ receiverId: 'user-2' });
    expect(mockShowSuccess).toHaveBeenCalledWith({
      title: 'home.interest_sent_title',
      message: 'home.interest_sent_message',
    });

    await act(async () => {
      await result.current.handlePrimaryAction(
        match({ isInterestPending: true, interestId: 'interest-1' })
      );
    });
    expect(mockWithdrawInterest).toHaveBeenCalledWith({
      interestId: 'interest-1',
    });

    await act(async () => {
      await result.current.handleShortlist(match());
    });
    expect(mockShortlistProfile).toHaveBeenCalledWith({ userId: 'user-2' });

    await act(async () => {
      await result.current.handleShortlist(match({ isShortlisted: true }));
    });
    expect(mockRemoveShortlistedProfile).toHaveBeenCalledWith({
      userId: 'user-2',
    });
  });

  it('opens chats for accepted matches and shows upgrade prompt on plan access errors', async () => {
    const { result } = await renderHook(() =>
      useHomeActions(navigation as never)
    );

    await act(async () => {
      await result.current.handlePrimaryAction(match({ isMatched: true }));
    });

    expect(mockCreateDirectRoom).toHaveBeenCalledWith({
      targetUserId: 'user-2',
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
      await result.current.handlePrimaryAction(match({ isMatched: true }));
    });

    expect(mockShowUpgradePrompt).toHaveBeenCalledWith('home.action_chat');
  });

  it('handles action errors and refreshes all home data sources', async () => {
    mockSendInterest.mockReturnValueOnce({
      unwrap: jest.fn().mockRejectedValue(new Error('failed')),
    });
    const { result } = await renderHook(() =>
      useHomeActions(navigation as never)
    );

    await act(async () => {
      await result.current.handlePrimaryAction(match());
    });
    expect(mockShowError).toHaveBeenCalledWith({
      title: 'home.interest_failed_title',
      message: 'home.interest_failed_message',
    });

    const refetch = jest.fn();
    const refetchMatches = jest.fn();
    const refetchShortlisted = jest.fn();
    const refetchSentInterests = jest.fn();
    const setRefreshing = jest.fn();
    const setPage = jest.fn();

    await act(async () => {
      await result.current.handleRefresh(
        1,
        refetch,
        refetchMatches,
        refetchShortlisted,
        refetchSentInterests,
        setRefreshing,
        setPage
      );
    });

    expect(setRefreshing).toHaveBeenNthCalledWith(1, true);
    expect(setPage).toHaveBeenCalledWith(1);
    expect(refetch).toHaveBeenCalled();
    expect(refetchMatches).toHaveBeenCalled();
    expect(refetchShortlisted).toHaveBeenCalled();
    expect(refetchSentInterests).toHaveBeenCalled();
    expect(setRefreshing).toHaveBeenLastCalledWith(false);
  });
});
