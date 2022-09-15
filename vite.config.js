import { defineConfig } from 'vite';
import preact from "@preact/preset-vite";
import postcssNesting from 'postcss-nesting';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'

// https://vitejs.dev/config/
export default defineConfig({
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
    port: 3000
  },
  build: {
    outDir: './dist'
  }
});
