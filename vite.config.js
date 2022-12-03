import { defineConfig } from 'vite'
import preact from "@preact/preset-vite"
import postcssNesting from 'postcss-nesting'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'

// https://vitejs.dev/config/
export default defineConfig({
    jsx: {
        factory: 'h',
        fragment: 'Fragment'
    },
    publicDir: '_public',
    plugins: [
        preact(),
        NodeGlobalsPolyfillPlugin({
            buffer: true
        })
    ],
    css: {
        postcss: {
            plugins: [
                postcssNesting
            ],
        },
    },
    server: {
        port: 8888
    },
    build: {
        minify: false,
        outDir: './dist',
        sourcemap: true
    }
})
