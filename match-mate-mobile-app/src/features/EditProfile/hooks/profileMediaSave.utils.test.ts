import { executeProfileMediaSave } from './profileMediaSave.utils';

describe('profile media save workflow', () => {
  it('removes, uploads, and assigns the first new primary in order', async () => {
    const calls: string[] = [];
    await executeProfileMediaSave({
      removedIds: ['old-1'],
      remove: async (id) => {
        calls.push(`remove:${id}`);
      },
      upload: async () => {
        calls.push('upload');
        return 'new-1';
      },
      hadExistingVisibleMedia: false,
      setPrimary: async (id) => {
        calls.push(`primary:${id}`);
      },
    });

    expect(calls).toEqual(['remove:old-1', 'upload', 'primary:new-1']);
  });

  it('stops on failure and supports retrying the same staged plan', async () => {
    const remove = jest.fn().mockResolvedValue(undefined);
    const upload = jest
      .fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce('new-1');
    const setPrimary = jest.fn().mockResolvedValue(undefined);
    const plan = {
      removedIds: ['old-1'],
      remove,
      upload,
      hadExistingVisibleMedia: false,
      setPrimary,
    };

    await expect(executeProfileMediaSave(plan)).rejects.toThrow('network');
    expect(setPrimary).not.toHaveBeenCalled();
    await expect(executeProfileMediaSave(plan)).resolves.toBeUndefined();
    expect(upload).toHaveBeenCalledTimes(2);
    expect(setPrimary).toHaveBeenCalledWith('new-1');
  });

  it('honors an explicitly selected existing primary', async () => {
    const setPrimary = jest.fn().mockResolvedValue(undefined);
    await executeProfileMediaSave({
      removedIds: [],
      remove: jest.fn(),
      upload: async () => 'new-1',
      preferredPrimaryId: 'existing-2',
      hadExistingVisibleMedia: true,
      setPrimary,
    });
    expect(setPrimary).toHaveBeenCalledWith('existing-2');
  });
});
