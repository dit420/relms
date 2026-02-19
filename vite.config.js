import { defineConfig } from 'vite';

export default defineConfig({
    base: '/relms/',
    server: {
        port: 5173,
        open: false,
        allowedHosts: true
    },
    build: {
        outDir: 'dist'
    }
});
