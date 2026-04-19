const baseUrl = (process.env.SMOKE_BASE_URL || 'http://localhost:3000').replace(
  /\/$/,
  '',
);

const checks = [
  {
    path: '/api/v1',
    expectedStatus: 200,
    description: 'root endpoint',
  },
  {
    path: '/api/v1/health',
    expectedStatus: 200,
    description: 'health endpoint',
  },
  {
    path: '/api/v1/notifications',
    expectedStatus: 401,
    description: 'protected notifications endpoint without auth',
  },
];

let hasFailure = false;

for (const check of checks) {
  const url = `${baseUrl}${check.path}`;

  try {
    const response = await fetch(url);
    const ok = response.status === check.expectedStatus;
    const symbol = ok ? 'PASS' : 'FAIL';

    console.log(
      `${symbol} ${check.description}: ${url} -> ${response.status} (expected ${check.expectedStatus})`,
    );

    if (!ok) {
      hasFailure = true;
    }
  } catch (error) {
    hasFailure = true;
    const message = error instanceof Error ? error.message : String(error);
    console.log(`FAIL ${check.description}: ${url} -> ${message}`);
  }
}

if (hasFailure) {
  process.exitCode = 1;
} else {
  console.log('Smoke test passed.');
}