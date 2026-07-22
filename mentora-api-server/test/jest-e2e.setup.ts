import path from 'node:path';

// Keep MongoDB test binaries inside the workspace so local, CI, and sandboxed
// runs do not depend on a writable user-profile cache.
process.env.MONGOMS_DOWNLOAD_DIR ??= path.resolve(
  process.cwd(),
  '.cache',
  'mongodb-binaries',
);
process.env.MONGOMS_PREFER_GLOBAL_PATH ??= 'false';
