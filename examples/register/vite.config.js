import {defineConfig} from 'vite'
import {visualizer} from "rollup-plugin-visualizer"
import react from '@vitejs/plugin-react'
import {NodeGlobalsPolyfillPlugin} from '@esbuild-plugins/node-globals-polyfill'

// https://vitejs.dev/config/
export default defineConfig({
    server:{
      port: 3000
    },
    plugins: [
        react(),
        visualizer({template: 'treemap'}),
    ],
    optimizeDeps: {
        esbuildOptions: {
            // Node.js global to browser globalThis
            define: {
                global: 'globalThis'
            },
            // Enable esbuild polyfill plugins
            plugins: [
                NodeGlobalsPolyfillPlugin({
                    buffer: true
                })
            ]
        },
    },
    resolve: {
        mainFields: ['main','module', 'jsnext:main', 'jsnext']
    },
})
