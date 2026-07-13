import { defineConfig } from 'vite';
import { execSync } from 'child_process';

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

export default defineConfig({
  plugins: [jsonWatcherPlugin()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  },
  publicDir: 'public'
});
