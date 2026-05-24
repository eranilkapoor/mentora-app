const { networkInterfaces } = require('os');
const { spawn } = require('child_process');

const args = process.argv.slice(2);
const apiPort = process.env.EXPO_PUBLIC_API_PORT || '3000';
const apiPath = process.env.EXPO_PUBLIC_API_PATH || '/api/v1';

function getLanIp() {
  const interfaces = networkInterfaces();
  const candidates = [];

  for (const addresses of Object.values(interfaces)) {
    for (const address of addresses || []) {
      if (address.family !== 'IPv4' || address.internal) continue;

      candidates.push(address.address);
    }
  }

  return (
    candidates.find((address) => address.startsWith('192.168.')) ||
    candidates.find((address) => address.startsWith('10.')) ||
    candidates.find((address) => /^172\.(1[6-9]|2\d|3[0-1])\./.test(address)) ||
    candidates[0]
  );
}

const lanIp = getLanIp();

if (!lanIp) {
  console.warn(
    'Could not detect a LAN IPv4 address. Falling back to Expo defaults.'
  );
}

const env = {
  ...process.env,
  ...(lanIp
    ? {
        EXPO_PUBLIC_API_BASE_URL: `http://${lanIp}:${apiPort}${apiPath}`,
        REACT_NATIVE_PACKAGER_HOSTNAME: lanIp,
      }
    : {}),
};

if (lanIp) {
  console.log(`Expo LAN host: ${lanIp}`);
  console.log(`API base URL: http://${lanIp}:${apiPort}${apiPath}`);
}

const child = spawn('npx', ['expo', 'start', ...args], {
  env,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
