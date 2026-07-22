import { SuccessCode } from '@/common/constants';
import { AdminCuratedMatchesController } from './admin-curated-matches.controller';

describe('AdminCuratedMatchesController', () => {
  const curatorService = {
    getAdminCuratedMatches: jest.fn(),
    curateMatch: jest.fn(),
    expireCuratedMatch: jest.fn(),
  };

  const auditService = {
    write: jest.fn(),
  };

  let controller: AdminCuratedMatchesController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AdminCuratedMatchesController(
      curatorService as never,
      auditService as never,
    );
  });

  it('lists curated matches with limit parsing', async () => {
    curatorService.getAdminCuratedMatches.mockResolvedValue([]);

    const response = await controller.listCuratedMatches('u1', '25');

    expect(curatorService.getAdminCuratedMatches).toHaveBeenCalledWith(
      'u1',
      25,
    );
    expect(response.code).toBe(SuccessCode.MATCHES_FETCHED);
  });

  it('lists curated matches without an optional limit', async () => {
    curatorService.getAdminCuratedMatches.mockResolvedValue([]);

    await controller.listCuratedMatches();

    expect(curatorService.getAdminCuratedMatches).toHaveBeenCalledWith(
      undefined,
      undefined,
    );
  });

  it('curates and expires matches with audit writes', async () => {
    curatorService.curateMatch.mockResolvedValue({ _id: 'c1' });
    curatorService.expireCuratedMatch.mockResolvedValue({ _id: 'c1' });
    const req = { user: { sub: 'admin-1' } };

    const create = await controller.curateMatch(
      req as never,
      {
        userId: 'u1',
        targetUserId: 'u2',
        note: 'high intent',
      } as never,
    );
    const expire = await controller.expireCuratedMatch(req as never, 'c1');

    expect(curatorService.curateMatch).toHaveBeenCalledWith('admin-1', {
      userId: 'u1',
      targetUserId: 'u2',
      note: 'high intent',
    });
    expect(curatorService.expireCuratedMatch).toHaveBeenCalledWith('c1');
    expect(create.code).toBe(SuccessCode.MATCHES_FETCHED);
    expect(expire.code).toBe(SuccessCode.MATCH_REMOVED);
    expect(auditService.write).toHaveBeenCalledTimes(2);
  });

  it('omits empty curator results from audit snapshots', async () => {
    curatorService.curateMatch.mockResolvedValue(null);
    curatorService.expireCuratedMatch.mockResolvedValue(null);
    const req = { user: { sub: 'admin-1' } };

    await controller.curateMatch(
      req as never,
      {
        userId: 'u1',
        targetUserId: 'u2',
      } as never,
    );
    await controller.expireCuratedMatch(req as never, 'c1');

    expect(auditService.write).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ after: undefined }),
    );
    expect(auditService.write).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ after: undefined }),
    );
  });
});
