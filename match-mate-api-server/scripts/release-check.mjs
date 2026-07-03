import { spawn } from 'node:child_process';

const checks = [
  { name: 'env validation', command: 'npm', args: ['run', 'env:validate'] },
  {
    name: 'migration manifest validation',
    command: 'npm',
    args: ['run', 'migration:validate'],
  },
  {
    name: 'provider configuration smoke',
    command: 'npm',
    args: ['run', 'smoke:providers:strict'],
  },
  { name: 'lint', command: 'npm', args: ['run', 'lint:check'] },
  { name: 'typecheck', command: 'npm', args: ['run', 'typecheck'] },
  { name: 'tests', command: 'npm', args: ['run', 'test', '--', '--runInBand'] },
  { name: 'build', command: 'npm', args: ['run', 'build'] },
  {
    name: 'openapi contract drift',
    command: 'npm',
    args: ['--prefix', '..', 'run', 'contracts:check'],
  },
  {
    name: 'mobile i18n checks',
    command: 'npm',
    args: ['--prefix', '..', 'run', 'i18n:check'],
  },
];

if (process.env.RELEASE_CHECK_RUN_SMOKE === 'true') {
  checks.push({
    name: 'api smoke',
    command: 'npm',
    args: ['run', 'smoke:local'],
  });
}

function runCommand(check) {
  return new Promise((resolve, reject) => {
    const child = spawn(check.command, check.args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: process.env,
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve(undefined);
        return;
      }

      reject(
        new Error(`${check.name} failed with exit code ${code ?? 'unknown'}`),
      );
    });
  });
}

async function run() {
  for (const check of checks) {
    console.log(`\n=== ${check.name} ===`);
    await runCommand(check);
  }

  console.log('\nRelease checks passed.');
}

run().catch((error) => {
  console.error(
    `Release checks failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
});
