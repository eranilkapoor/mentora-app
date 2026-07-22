import { buildPaginationMeta } from './pagination';

describe('buildPaginationMeta', () => {
  it.each([
    [0, 1, 20, 0, false, false],
    [21, 1, 20, 2, true, false],
    [21, 2, 20, 2, false, true],
  ])(
    'normalizes total=%s page=%s limit=%s',
    (total, page, limit, totalPages, hasNextPage, hasPrevPage) => {
      expect(buildPaginationMeta(total, page, limit)).toEqual({
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      });
    },
  );

  it('protects against a zero limit', () => {
    expect(buildPaginationMeta(2, 1, 0)).toEqual({
      total: 2,
      page: 1,
      limit: 1,
      totalPages: 2,
      hasNextPage: true,
      hasPrevPage: false,
    });
  });
});
