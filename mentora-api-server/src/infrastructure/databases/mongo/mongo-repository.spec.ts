import { MongoRepository } from './mongo-repository';

interface Entity {
  id: string;
  name: string;
}

describe('MongoRepository', () => {
  const lean = jest.fn();
  const query = {
    sort: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    lean,
  };
  const savedDocument = { id: '1', name: 'Asha' };
  const save = jest.fn();
  const model = Object.assign(
    jest.fn().mockImplementation(() => ({ save })),
    {
      findById: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      deleteOne: jest.fn(),
      countDocuments: jest.fn(),
      exists: jest.fn(),
    },
  );

  let repository: MongoRepository<Entity>;

  beforeEach(() => {
    jest.clearAllMocks();
    query.sort.mockReturnValue(query);
    query.skip.mockReturnValue(query);
    query.limit.mockReturnValue(query);
    query.lean.mockResolvedValue([savedDocument]);
    model.find.mockReturnValue(query);
    model.findById.mockReturnValue({ lean });
    model.findOne.mockReturnValue({ lean });
    model.findByIdAndUpdate.mockReturnValue({ lean });
    model.findOneAndUpdate.mockReturnValue({ lean });
    save.mockResolvedValue({ toObject: () => savedDocument });
    repository = new MongoRepository<Entity>(model as never);
  });

  it('finds entities by id and filter', async () => {
    lean.mockResolvedValue(savedDocument);
    await expect(repository.findById('1')).resolves.toBe(savedDocument);
    await expect(repository.findOne({ name: 'Asha' })).resolves.toBe(
      savedDocument,
    );
    expect(model.findById).toHaveBeenCalledWith('1');
    expect(model.findOne).toHaveBeenCalledWith({ name: 'Asha' });
  });

  it('finds with defaults or complete query options', async () => {
    await repository.find();
    expect(model.find).toHaveBeenNthCalledWith(1, {});
    expect(query.sort).not.toHaveBeenCalled();

    await repository.find(
      { name: 'Asha' },
      { sort: { name: 1 }, skip: 2, limit: 10 },
    );
    expect(query.sort).toHaveBeenCalledWith({ name: 1 });
    expect(query.skip).toHaveBeenCalledWith(2);
    expect(query.limit).toHaveBeenCalledWith(10);
  });

  it('does not apply zero-valued pagination options', async () => {
    await repository.find({}, { skip: 0, limit: 0 });
    expect(query.skip).not.toHaveBeenCalled();
    expect(query.limit).not.toHaveBeenCalled();
  });

  it('creates and converts a model document', async () => {
    await expect(repository.create({ name: 'Asha' })).resolves.toBe(
      savedDocument,
    );
    expect(model).toHaveBeenCalledWith({ name: 'Asha' });
  });

  it('updates by id and by filter using $set', async () => {
    lean.mockResolvedValue(savedDocument);
    await repository.updateById('1', { name: 'Anita' });
    await repository.updateOne({ id: '1' }, { name: 'Anita' });
    expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
      '1',
      { $set: { name: 'Anita' } },
      { new: true },
    );
    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      { id: '1' },
      { $set: { name: 'Anita' } },
      { new: true },
    );
  });

  it.each([
    [{ id: '1' }, true],
    [null, false],
  ])('maps findByIdAndDelete results to %s', async (result, expected) => {
    model.findByIdAndDelete.mockResolvedValue(result);
    await expect(repository.deleteById('1')).resolves.toBe(expected);
  });

  it.each([
    [1, true],
    [0, false],
  ])('maps delete counts to %s', async (deletedCount, expected) => {
    model.deleteOne.mockResolvedValue({ deletedCount });
    await expect(repository.deleteOne({ id: '1' })).resolves.toBe(expected);
  });

  it('counts with default and explicit filters', async () => {
    model.countDocuments.mockResolvedValue(3);
    await expect(repository.count()).resolves.toBe(3);
    await repository.count({ name: 'Asha' });
    expect(model.countDocuments).toHaveBeenNthCalledWith(1, {});
    expect(model.countDocuments).toHaveBeenNthCalledWith(2, { name: 'Asha' });
  });

  it.each([
    [{ _id: '1' }, true],
    [null, false],
  ])('maps existence results to %s', async (result, expected) => {
    model.exists.mockResolvedValue(result);
    await expect(repository.exists({ id: '1' })).resolves.toBe(expected);
  });
});
