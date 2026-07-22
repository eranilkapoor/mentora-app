import { Status } from '@/common/enums';
import { AdminRepository } from './admin.repository';

const createFindChain = () => {
  const chain = {
    select: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    sort: jest.fn(),
    lean: jest.fn(),
  };

  chain.select.mockReturnValue(chain);
  chain.skip.mockReturnValue(chain);
  chain.limit.mockReturnValue(chain);
  chain.sort.mockReturnValue(chain);
  chain.lean.mockReturnValue(chain);

  return chain;
};

describe('AdminRepository', () => {
  const userModel = {
    find: jest.fn(),
    countDocuments: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  let repository: AdminRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new AdminRepository(userModel as never);
  });

  it('findUsers applies filter, pagination defaults, projection, and sort', () => {
    const findChain = createFindChain();
    userModel.find.mockReturnValue(findChain);
    const filter = { status: Status.ACTIVE };

    repository.findUsers(filter);

    expect(userModel.find).toHaveBeenCalledWith(filter);
    expect(findChain.select).toHaveBeenCalledWith(
      '-password -refreshToken -authAccounts.passwordHash',
    );
    expect(findChain.skip).toHaveBeenCalledWith(0);
    expect(findChain.limit).toHaveBeenCalledWith(20);
    expect(findChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(findChain.lean).toHaveBeenCalledTimes(1);
  });

  it('findUsers supports explicit skip/limit for filtered admin lists', () => {
    const findChain = createFindChain();
    userModel.find.mockReturnValue(findChain);

    repository.findUsers({ status: Status.BLOCKED }, 40, 10);

    expect(findChain.skip).toHaveBeenCalledWith(40);
    expect(findChain.limit).toHaveBeenCalledWith(10);
  });

  it('findUsers supports empty filter for full admin listing paths', () => {
    const findChain = createFindChain();
    userModel.find.mockReturnValue(findChain);

    repository.findUsers({});

    expect(userModel.find).toHaveBeenCalledWith({});
    expect(findChain.skip).toHaveBeenCalledWith(0);
    expect(findChain.limit).toHaveBeenCalledWith(20);
  });

  it('findUsersForBroadcast selects safe fields and default/custom limits', () => {
    const defaultChain = createFindChain();
    userModel.find.mockReturnValueOnce(defaultChain);

    repository.findUsersForBroadcast({ status: Status.ACTIVE });

    expect(defaultChain.select).toHaveBeenCalledWith(
      '_id email phone membership status',
    );
    expect(defaultChain.limit).toHaveBeenCalledWith(1000);

    const customChain = createFindChain();
    userModel.find.mockReturnValueOnce(customChain);
    repository.findUsersForBroadcast({ status: Status.BLOCKED }, 25);
    expect(customChain.limit).toHaveBeenCalledWith(25);
  });

  it('findUsersForBroadcast forwards complex audience filter conditions', () => {
    const findChain = createFindChain();
    userModel.find.mockReturnValue(findChain);
    const filter = {
      status: Status.ACTIVE,
      $or: [{ 'membership.tier': { $ne: 'free' } }, { permissions: 'ADMIN' }],
    };

    repository.findUsersForBroadcast(filter, 50);

    expect(userModel.find).toHaveBeenCalledWith(filter);
    expect(findChain.limit).toHaveBeenCalledWith(50);
  });

  it('countUsers forwards filter query', () => {
    const filter = {
      status: Status.ACTIVE,
      'membership.tier': { $ne: 'free' },
    };

    repository.countUsers(filter);

    expect(userModel.countDocuments).toHaveBeenCalledWith(filter);
  });

  it('findUserById excludes sensitive credentials', () => {
    const findByIdChain = {
      select: jest.fn(),
      lean: jest.fn(),
    };
    findByIdChain.select.mockReturnValue(findByIdChain);
    findByIdChain.lean.mockReturnValue(findByIdChain);
    userModel.findById.mockReturnValue(findByIdChain);

    repository.findUserById('user-123');

    expect(userModel.findById).toHaveBeenCalledWith('user-123');
    expect(findByIdChain.select).toHaveBeenCalledWith(
      '-password -refreshToken -authAccounts.passwordHash',
    );
    expect(findByIdChain.lean).toHaveBeenCalledTimes(1);
  });

  it('updateUserStatus writes blocked and active transitions with validators', () => {
    repository.updateUserStatus('user-1', { status: Status.BLOCKED });
    expect(userModel.findByIdAndUpdate).toHaveBeenNthCalledWith(
      1,
      'user-1',
      { $set: { status: Status.BLOCKED } },
      { new: true, runValidators: true },
    );

    repository.updateUserStatus('user-1', { status: Status.ACTIVE });
    expect(userModel.findByIdAndUpdate).toHaveBeenNthCalledWith(
      2,
      'user-1',
      { $set: { status: Status.ACTIVE } },
      { new: true, runValidators: true },
    );
  });

  it('updateUserStatus allows partial update payloads for future admin transitions', () => {
    repository.updateUserStatus('user-2', {});

    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'user-2',
      { $set: {} },
      { new: true, runValidators: true },
    );
  });
});
