import path from 'path';
import checker from 'vite-plugin-checker';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// ----------------------------------------------------------------------

const PORT = 8081;

export default defineConfig({
  base: '/admin/',
  plugins: [
    react(),
    checker({
      typescript: true,
      eslint: {
        useFlatConfig: true,
        lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
        dev: { logLevel: ['error'] },
      },
      overlay: {
        position: 'tl',
        initialIsOpen: false,
      },
    }),
  ],
  resolve: {
    alias: [
      {
        find: /^src(.+)/,
        replacement: path.resolve(process.cwd(), 'src/$1'),
      },
    ],
  },
  server: {
    port: PORT,
    host: true,
    proxy: {
      // API 프록시 설정 (CORS 우회)
      '/safeyoui': {
        target: 'http://localhost:9000',
        changeOrigin: true,
        secure: false,
        // rewrite는 필요 없음 (경로 그대로 전달)
      },
    },
  },
  preview: { port: PORT, host: true },
});
