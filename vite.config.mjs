import { defineConfig } from 'vite';
import { execSync } from 'child_process';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';

const jsonWatcherPlugin = () => {
  let isRendering = false;
  return {
    name: 'json-watcher',
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.json') && file.includes('content')) {
        if (isRendering) return;
        isRendering = true;
        try {
          console.log(`JSON changed: ${file}. Re-rendering site...`);
          execSync('node scripts/render-site.mjs', { stdio: 'inherit' });
          server.ws.send({ type: 'full-reload' });
        } catch (err) {
          console.error('Rendering failed:', err.message);
        } finally {
          isRendering = false;
        }
      }
    }
  };
};

function getHtmlInputs() {
  const inputs = {};
  const rootDir = process.cwd();
  
  function scan(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (['node_modules', 'dist', 'src', 'public', '.git', 'tests', 'schemas', 'screenshots', 'test-results', '.local-node', '.github', 'node-v22.23.1-win-x64'].includes(entry.name) && dir === rootDir) continue;
      
      const res = path.resolve(dir, entry.name);
      if (entry.isDirectory()) {
        scan(res);
      } else if (entry.name.endsWith('.html')) {
        let name = path.relative(rootDir, res).replace(/\\/g, '/').replace('.html', '');
        if (name.endsWith('/index')) {
          name = name.slice(0, -6);
        }
        if (name === 'index') name = 'main';
        inputs[name] = res;
      }
    }
  }
  scan(rootDir);
  return inputs;
}

export default defineConfig({
  plugins: [jsonWatcherPlugin()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: getHtmlInputs()
    }
  },
  publicDir: 'public'
});
