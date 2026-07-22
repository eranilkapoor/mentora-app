import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useHomeData } from './useHomeData';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

type HomeDataResult = ReturnType<typeof useHomeData>;

const mockDiscoveryRefetch = jest.fn();
const mockMatchesRefetch = jest.fn();
const mockSentRefetch = jest.fn();
const mockShortlistedRefetch = jest.fn();
const mockUseDiscovery = jest.fn();

let mockDiscoveryData: unknown;
let mockMatchesData: unknown;
let mockSentInterestsData: unknown;
let mockShortlistedData: unknown;
let mockIsFetching = false;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) =>
      options?.defaultValue ?? key,
  }),
}));

jest.mock('@/core/utils/config', () => ({
  resolveApiUrl: (url?: string) => (url ? `https://api.example.com${url}` : ''),
}));

jest.mock('@/store/services/matchApi.service', () => ({
  useGetDiscoveryProfilesQuery: (query: unknown) => mockUseDiscovery(query),
  useGetMyMatchesQuery: () => ({
    data: mockMatchesData,
    refetch: mockMatchesRefetch,
  }),
  useGetSentInterestsQuery: () => ({
    data: mockSentInterestsData,
    refetch: mockSentRefetch,
  }),
  useGetShortlistedProfilesQuery: () => ({
    data: mockShortlistedData,
    refetch: mockShortlistedRefetch,
  }),
}));

const profile = (userId: string, firstName: string) => ({
  userId,
  age: 28,
  personal: {
    firstName,
    lastName: 'Sharma',
    city: 'Mumbai',
    state: 'MH',
    religion: 'hindu',
    religiousDetails: { caste: 'brahmin' },
  },
  physical: { height: 170 },
  education: { occupation: 'Engineer' },
  images: [
    { url: '/primary.jpg', isPrimary: true, isActive: true },
    { url: '/inactive.jpg', isActive: false },
  ],
  createdAt: new Date().toISOString(),
  lastActiveAt: new Date().toISOString(),
});

describe('useHomeData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsFetching = false;
    mockDiscoveryData = {
      data: [profile('user-2', 'Riya')],
      meta: { hasNextPage: true },
    };
    mockMatchesData = {
      data: [{ userId: 'user-1', targetUserId: 'user-2' }],
    };
    mockSentInterestsData = {
      data: [{ _id: 'interest-3', receiverId: 'user-3', status: 'pending' }],
    };
    mockShortlistedData = {
      data: [{ userId: 'user-2' }],
    };
    mockUseDiscovery.mockImplementation(() => ({
      data: mockDiscoveryData,
      refetch: mockDiscoveryRefetch,
      isFetching: mockIsFetching,
    }));
  });

  it('maps discovery profiles with match and shortlist status', async () => {
    const { result } = await renderHook(() => useHomeData(' riya '));

    await waitFor(() => {
      expect(result.current.profiles).toHaveLength(1);
    });

    expect(mockUseDiscovery).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'recommended',
        page: 1,
        search: 'riya',
      })
    );
    expect(result.current.profiles[0]).toEqual(
      expect.objectContaining({
        userId: 'user-2',
        name: 'Riya Sharma',
        location: 'Mumbai, MH',
        isMatched: true,
        isShortlisted: true,
        isOnline: true,
        isNew: true,
      })
    );
    expect(result.current.profiles[0]?.photos[0]).toBe(
      'https://api.example.com/primary.jpg'
    );
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.myMatches).toBe(mockMatchesData);
    expect(result.current.refetch).toBe(mockDiscoveryRefetch);
  });

  it('appends next pages without duplicating users and resets on search change', async () => {
    const { result, rerender } = await renderHook<
      HomeDataResult,
      { query: string }
    >(({ query }) => useHomeData(query), { initialProps: { query: '' } });

    await waitFor(() => {
      expect(result.current.profiles.map((item) => item.userId)).toEqual([
        'user-2',
      ]);
    });

    mockDiscoveryData = {
      data: [profile('user-2', 'Riya'), profile('user-3', 'Asha')],
      meta: { hasNextPage: false },
    };

    await act(async () => {
      result.current.setPage(2);
    });

    await waitFor(() => {
      expect(result.current.profiles.map((item) => item.userId)).toEqual([
        'user-2',
        'user-3',
      ]);
    });

    mockDiscoveryData = undefined;
    await rerender({ query: 'asha' });

    await waitFor(() => {
      expect(result.current.page).toBe(1);
    });
    expect(result.current.profiles).toEqual([]);
    expect(mockUseDiscovery).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'asha', page: 1 })
    );
  });
});
