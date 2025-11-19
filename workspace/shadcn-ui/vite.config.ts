import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { viteSourceLocator } from '@metagptx/vite-plugin-source-locator';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // CRÍTICO: Esta línea es la única que falta para que GitHub Pages funcione.
  // Le dice a Vite que todos los archivos compilados deben usar la ruta del repositorio.
  base: '/amigos-de-tron/', 
  plugins: [
    viteSourceLocator({
      prefix: 'mgx',
    }),
    react(),
  ],
  server: {
    watch: { usePolling: true, interval: 800 /* 300~1500 */ },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
