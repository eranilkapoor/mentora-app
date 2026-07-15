const { spawn } = require('child_process');
const { existsSync, readFileSync, writeFileSync } = require('fs');
const { join } = require('path');
const { homedir } = require('os');

const projectDir = join(__dirname, '..');
const androidDir = join(__dirname, '..', 'android');
const gradleCommand = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const args = process.argv.slice(2);
const gradleArgs = args.length > 0 ? args : ['bundleRelease'];
const keystoreDir = join(homedir(), '.match-mate', 'keystores');
const keystorePath = join(keystoreDir, 'match-mate-production.jks');
const credentialsPath = join(keystoreDir, 'match-mate-production-keystore.txt');
const versionCodeFile = join(projectDir, '.android-version-code');
const minimumVersionCode = 16;
const shouldPersistVersionCode = !args.includes('--dry-run');

function readCredential(label) {
  if (!existsSync(credentialsPath)) return undefined;

  const match = readFileSync(credentialsPath, 'utf8').match(
    new RegExp(`^${label}: (.+)$`, 'm')
  );

  return match?.[1];
}

const uploadSigningEnv =
  existsSync(keystorePath) && existsSync(credentialsPath)
    ? {
        MATCH_MATE_UPLOAD_STORE_FILE: keystorePath,
        MATCH_MATE_UPLOAD_STORE_PASSWORD: readCredential('Store password'),
        MATCH_MATE_UPLOAD_KEY_ALIAS: 'match-mate-production',
        MATCH_MATE_UPLOAD_KEY_PASSWORD: readCredential('Key password'),
      }
    : {};

function resolveVersionCode() {
  if (process.env.ANDROID_VERSION_CODE) return process.env.ANDROID_VERSION_CODE;

  const previousVersionCode = existsSync(versionCodeFile)
    ? Number.parseInt(readFileSync(versionCodeFile, 'utf8').trim(), 10)
    : minimumVersionCode - 1;
  const nextVersionCode = Math.max(
    Number.isFinite(previousVersionCode) ? previousVersionCode + 1 : minimumVersionCode,
    minimumVersionCode
  );

  if (shouldPersistVersionCode) {
    writeFileSync(versionCodeFile, `${nextVersionCode}\n`, 'utf8');
  }

  return String(nextVersionCode);
}

const androidVersionCode = resolveVersionCode();
console.log(`Android versionCode: ${androidVersionCode}`);

const child = spawn(gradleCommand, gradleArgs, {
  cwd: androidDir,
  env: {
    ...process.env,
    NODE_ENV: 'production',
    ANDROID_VERSION_CODE: androidVersionCode,
    ...uploadSigningEnv,
  },
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
