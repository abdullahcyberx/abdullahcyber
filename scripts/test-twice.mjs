import { execSync } from 'node:child_process';
import fs from 'node:fs';

const run = (cmd) => {
  console.log(`\n==================================================\nRUNNING: ${cmd}\n==================================================\n`);
  execSync(cmd, { stdio: 'inherit' });
};

try {
  run('npm ci');
  run('npm run test:local');
  
  console.log('Pass 1 succeeded. Cleaning up for Pass 2...');
  
  // Cleanup node_modules and dist
  if (fs.existsSync('node_modules')) {
    fs.rmSync('node_modules', { recursive: true, force: true });
  }
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  
  run('npm ci');
  run('npm run test:local');
  
  console.log('Both passes succeeded!');
} catch (err) {
  console.error('\nTest suite failed.');
  process.exit(1);
}
