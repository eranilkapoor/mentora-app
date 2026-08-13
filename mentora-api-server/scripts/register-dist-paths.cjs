const Module = require('node:module');
const path = require('node:path');

const distRoot = path.resolve(__dirname, '..', 'dist');
const aliasPrefix = '@/';
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function resolveMentoraAlias(
  request,
  parent,
  isMain,
  options,
) {
  if (typeof request === 'string' && request.startsWith(aliasPrefix)) {
    return originalResolveFilename.call(
      this,
      path.join(distRoot, request.slice(aliasPrefix.length)),
      parent,
      isMain,
      options,
    );
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};
