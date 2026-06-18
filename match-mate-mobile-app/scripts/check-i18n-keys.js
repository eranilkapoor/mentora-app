const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src');
const localesDir = path.join(srcDir, 'i18n', 'locales');
const localeNames = ['en', 'hi'];
const supportedExtensions = new Set(['.ts', '.tsx']);

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const walk = (dir, files = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (fullPath === localesDir) continue;
      walk(fullPath, files);
      continue;
    }

    if (supportedExtensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
};

const flattenKeys = (value, prefix = '', output = new Set()) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    if (prefix) output.add(prefix);
    return output;
  }

  for (const [key, child] of Object.entries(value)) {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    flattenKeys(child, nextPrefix, output);
  }

  return output;
};

const loadLocaleKeys = (localeName) => {
  const dir = path.join(localesDir, localeName);
  const keys = new Set();

  for (const fileName of fs.readdirSync(dir)) {
    if (!fileName.endsWith('.json')) continue;

    const namespace = path.basename(fileName, '.json');
    const json = readJson(path.join(dir, fileName));

    for (const key of flattenKeys(json)) {
      keys.add(`${namespace}.${key}`);
      keys.add(`${namespace}:${key}`);
    }
  }

  return keys;
};

const extractStaticTranslationKeys = () => {
  const keys = new Map();
  const matcher = /\bt\(\s*(['"`])([^'"`$]+)\1/g;

  for (const filePath of walk(srcDir)) {
    const source = fs.readFileSync(filePath, 'utf8');
    let match;

    while ((match = matcher.exec(source))) {
      const key = match[2].trim();

      if (!key || key.includes('${')) continue;
      if (!key.includes('.') && !key.includes(':')) continue;

      const relativePath = path.relative(root, filePath).replace(/\\/g, '/');
      const line = source.slice(0, match.index).split('\n').length;
      const locations = keys.get(key) ?? [];
      locations.push(`${relativePath}:${line}`);
      keys.set(key, locations);
    }
  }

  return keys;
};

const localeKeys = Object.fromEntries(
  localeNames.map((localeName) => [localeName, loadLocaleKeys(localeName)])
);
const translationKeys = extractStaticTranslationKeys();
const missing = [];

for (const [key, locations] of translationKeys) {
  for (const localeName of localeNames) {
    if (!localeKeys[localeName].has(key)) {
      missing.push({ key, localeName, locations });
    }
  }
}

if (missing.length) {
  console.error('Missing i18n keys found:\n');

  for (const item of missing) {
    console.error(`- ${item.localeName}: ${item.key}`);
    console.error(`  ${item.locations.slice(0, 5).join(', ')}`);
  }

  process.exit(1);
}

console.log(
  `i18n key check passed for ${translationKeys.size} static keys across ${localeNames.join(
    ', '
  )}.`
);
