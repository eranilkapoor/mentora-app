import { Types } from 'mongoose';
import { ModuleRecordsService } from './module-records.service';

describe('ModuleRecordsService', () => {
  const model = {
    findOneAndUpdate: jest.fn(),
    updateMany: jest.fn(),
  };
  const auditService = {
    write: jest.fn(),
  };
  let service: ModuleRecordsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ModuleRecordsService(model as never, auditService as never);
  });

  it('filters updates by module key when a dedicated wrapper supplies one', async () => {
    const organizationId = new Types.ObjectId().toString();
    const recordId = new Types.ObjectId().toString();
    const actorId = new Types.ObjectId().toString();
    const record = {
      _id: new Types.ObjectId(recordId),
      moduleKey: 'contacts',
      toObject: () => ({ _id: recordId, moduleKey: 'contacts' }),
    };
    model.findOneAndUpdate.mockResolvedValue(record);

    await service.updateModuleRecord(actorId, recordId, {
      organizationId,
      moduleKey: 'contacts',
      title: 'Guardian contact',
    });

    const [filter, update, options] = model.findOneAndUpdate.mock.calls[0] as [
      Record<string, unknown>,
      Record<string, unknown>,
      Record<string, unknown>,
    ];
    expect(filter._id).toBeInstanceOf(Types.ObjectId);
    expect(filter.moduleKey).toBe('contacts');
    expect(filter.organizationId).toBeInstanceOf(Types.ObjectId);
    expect(update.moduleKey).toBeUndefined();
    expect(options).toEqual({ new: true });
  });

  it('filters bulk status updates by module key when supplied', async () => {
    const organizationId = new Types.ObjectId().toString();
    const actorId = new Types.ObjectId().toString();
    const recordIds = [
      new Types.ObjectId().toString(),
      new Types.ObjectId().toString(),
    ];
    model.updateMany.mockResolvedValue({ matchedCount: 2, modifiedCount: 2 });

    await service.bulkUpdateStatus(actorId, {
      organizationId,
      moduleKey: 'notes',
      recordIds,
      status: 'archived',
    });

    const [filter, update] = model.updateMany.mock.calls[0] as [
      {
        _id: { $in: Types.ObjectId[] };
        moduleKey?: string;
        organizationId?: unknown;
      },
      { $set: { status: string; updatedAt: Date } },
    ];
    expect(filter._id.$in).toHaveLength(2);
    expect(filter._id.$in.every((id) => id instanceof Types.ObjectId)).toBe(
      true,
    );
    expect(filter.moduleKey).toBe('notes');
    expect(filter.organizationId).toBeInstanceOf(Types.ObjectId);
    expect(update.$set.status).toBe('archived');
    expect(update.$set.updatedAt).toBeInstanceOf(Date);
  });
});
