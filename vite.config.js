import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api/cricbuzz': {
        target: 'https://www.cricbuzz.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cricbuzz/, '')
      }
    }
  }
});
