import { act, renderHook } from '@testing-library/react-native';
import { useUpgradePrompt } from './useUpgradePrompt';

interface ConfirmOptions {
  message: string;
  onConfirm(): void;
}

const mockShowConfirm = jest.fn<void, [ConfirmOptions]>();
const mockDispatch = jest.fn<void, [unknown]>();

jest.mock('@/core/utils/confirm', () => ({
  showConfirm: (options: ConfirmOptions) => mockShowConfirm(options),
}));

jest.mock('@/navigation/navigationRef', () => ({
  navigationRef: {
    isReady: () => true,
    dispatch: (action: unknown) => mockDispatch(action),
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string; feature?: string }) =>
      options?.defaultValue?.replace(
        '{{feature}}',
        options.feature ?? 'feature'
      ) ?? key,
  }),
}));

describe('useUpgradePrompt', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows the locked feature name and navigates to membership', async () => {
    const { result } = await renderHook(() => useUpgradePrompt());

    await act(() => result.current('Video introduction'));

    expect(mockShowConfirm).toHaveBeenCalledTimes(1);
    const options = mockShowConfirm.mock.calls[0]?.[0];
    if (!options) {
      throw new Error('Expected the upgrade confirmation to be shown');
    }
    expect(options.message).toContain('Video introduction');

    await act(async () => {
      options.onConfirm();
    });
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch.mock.calls[0]?.[0]).toMatchObject({
      payload: { name: 'App' },
    });
  });
});
