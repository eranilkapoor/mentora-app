export type MatchListViewState =
  'offline' | 'error' | 'loading' | 'empty' | 'ready';

export const deriveMatchListViewState = ({
  isOffline,
  hasError,
  isLoading,
  itemCount,
}: {
  isOffline: boolean;
  hasError: boolean;
  isLoading: boolean;
  itemCount: number;
}): MatchListViewState => {
  if (isOffline) {
    return 'offline';
  }

  if (hasError) {
    return 'error';
  }

  if (isLoading) {
    return 'loading';
  }

  if (itemCount <= 0) {
    return 'empty';
  }

  return 'ready';
};
