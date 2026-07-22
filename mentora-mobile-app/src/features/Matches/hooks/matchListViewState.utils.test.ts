import { deriveMatchListViewState } from './matchListViewState.utils';

describe('deriveMatchListViewState', () => {
  it('prioritizes offline and error over other states', () => {
    expect(
      deriveMatchListViewState({
        isOffline: true,
        hasError: true,
        isLoading: true,
        itemCount: 5,
      })
    ).toBe('offline');

    expect(
      deriveMatchListViewState({
        isOffline: false,
        hasError: true,
        isLoading: true,
        itemCount: 5,
      })
    ).toBe('error');
  });

  it('returns loading, empty, and ready states deterministically', () => {
    expect(
      deriveMatchListViewState({
        isOffline: false,
        hasError: false,
        isLoading: true,
        itemCount: 5,
      })
    ).toBe('loading');

    expect(
      deriveMatchListViewState({
        isOffline: false,
        hasError: false,
        isLoading: false,
        itemCount: 0,
      })
    ).toBe('empty');

    expect(
      deriveMatchListViewState({
        isOffline: false,
        hasError: false,
        isLoading: false,
        itemCount: 3,
      })
    ).toBe('ready');
  });
});
