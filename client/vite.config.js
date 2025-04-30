import { fileURLToPath, URL } from 'node:url';
import fs from 'fs';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';
// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        vueJsx(),
        vueDevTools(),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
    server: {
        https: {
            key: process.env.VITE_DEV_SSL_KEY ?
                fs.readFileSync(process.env.VITE_DEV_SSL_KEY) : undefined,
            cert: process.env.VITE_DEV_SSL_CERT ?
                fs.readFileSync(process.env.VITE_DEV_SSL_CERT) : undefined,
        },
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/api/, '/api/v1')
            }
        }
    }
});
