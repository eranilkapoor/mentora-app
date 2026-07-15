const { spawn } = require('child_process');
const { existsSync, readFileSync } = require('fs');
const { join } = require('path');
const { homedir } = require('os');

const androidDir = join(__dirname, '..', 'android');
const gradleCommand = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const args = ['bundleRelease'];
const keystoreDir = join(homedir(), '.match-mate', 'keystores');
const keystorePath = join(keystoreDir, 'match-mate-production.jks');
const credentialsPath = join(keystoreDir, 'match-mate-production-keystore.txt');

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

const child = spawn(gradleCommand, args, {
  cwd: androidDir,
  env: {
    ...process.env,
    NODE_ENV: 'production',
    ...uploadSigningEnv,
  },
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
