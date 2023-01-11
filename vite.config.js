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
        host: true
    },
    build: {
        minify: false,
        outDir: './dist',
        sourcemap: 'inline'
    }
})
