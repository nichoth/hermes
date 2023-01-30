import { defineConfig } from 'vite'
import preact from "@preact/preset-vite"
import postcssNesting from 'postcss-nesting'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        preact({
            devtoolsInProd: false,
            prefreshEnabled: true,
            babel: {
                sourceMaps: "both"
            }
        }),
        NodeGlobalsPolyfillPlugin({
            buffer: true
        }),
    ],
    // https://github.com/vitejs/vite/issues/8644#issuecomment-1159308803
    esbuild: {
        logOverride: { 'this-is-undefined-in-esm': 'silent' }
    },
    publicDir: '_public',
    css: {
        postcss: {
            plugins: [
                postcssNesting
            ],
        },
    },
    server: {
        port: 8888,
        host: true,
        // this is b/c we were getting an odd error about module resolution
        // in dev, but it doesn't seem to affect the app at all
        // hmr: {
        //     overlay: false
        // }
    },
    build: {
        minify: false,
        outDir: './dist',
        sourcemap: 'inline'
    }
})
