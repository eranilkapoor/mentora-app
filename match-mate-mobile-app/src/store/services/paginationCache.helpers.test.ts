import {
  mergePaginatedApiResponse,
  serializePaginatedQueryArgs,
  shouldRefetchPaginatedQuery,
} from './paginationCache.helpers';

describe('paginationCache helpers', () => {
  it('serializes page variants into one cache per filter set', () => {
    expect(
      serializePaginatedQueryArgs({
        endpointName: 'getDiscoveryProfiles',
        queryArgs: {
          type: 'recommended',
          page: 1,
          limit: 20,
          search: '',
          city: undefined,
        },
      })
    ).toBe(
      serializePaginatedQueryArgs({
        endpointName: 'getDiscoveryProfiles',
        queryArgs: {
          type: 'recommended',
          page: 3,
          limit: 20,
        },
      })
    );

    expect(
      serializePaginatedQueryArgs({
        endpointName: 'getDiscoveryProfiles',
        queryArgs: { type: 'recommended', page: 1, limit: 20 },
      })
    ).not.toBe(
      serializePaginatedQueryArgs({
        endpointName: 'getDiscoveryProfiles',
        queryArgs: { type: 'new', page: 1, limit: 20 },
      })
    );
  });

  it('refetches when page or filters change', () => {
    expect(
      shouldRefetchPaginatedQuery({
        currentArg: { page: 2, limit: 20, type: 'new' },
        previousArg: { page: 1, limit: 20, type: 'new' },
      })
    ).toBe(true);

    expect(
      shouldRefetchPaginatedQuery({
        currentArg: { page: 1, limit: 20, type: 'nearby' },
        previousArg: { page: 1, limit: 20, type: 'new' },
      })
    ).toBe(true);

    expect(
      shouldRefetchPaginatedQuery({
        currentArg: { page: 1, limit: 20, type: 'new' },
        previousArg: { page: 1, limit: 20, type: 'new' },
      })
    ).toBe(false);
  });

  it('replaces cache for first page and appends later pages without duplicate ids', () => {
    const cache = {
      success: true,
      data: [{ _id: 'old' }],
      meta: { page: 1 },
    };

    mergePaginatedApiResponse(
      cache,
      {
        success: true,
        data: [{ _id: 'a' }],
        meta: { page: 1 },
      },
      { arg: { page: 1 } }
    );

    expect(cache.data).toEqual([{ _id: 'a' }]);

    mergePaginatedApiResponse(
      cache,
      {
        success: true,
        data: [{ _id: 'a' }, { _id: 'b' }],
        meta: { page: 2 },
      },
      { arg: { page: 2 } }
    );

    expect(cache.data).toEqual([{ _id: 'a' }, { _id: 'b' }]);
    expect(cache.meta).toEqual({ page: 2 });
  });

  it('supports contract responses with data.items', () => {
    const cache = {
      success: true,
      data: {
        items: [{ id: 'one' }],
        page: 1,
        limit: 10,
        total: 2,
      },
    };

    mergePaginatedApiResponse(
      cache,
      {
        success: true,
        data: {
          items: [{ id: 'two' }],
          page: 2,
          limit: 10,
          total: 2,
        },
      },
      { arg: { page: 2 } }
    );

    expect(cache.data.items).toEqual([{ id: 'one' }, { id: 'two' }]);
    expect(cache.data.page).toBe(2);
  });
});
