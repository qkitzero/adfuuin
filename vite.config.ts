import { crx } from '@crxjs/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import manifest from './manifest.json';

declare const process: { env: Record<string, string | undefined> };

const version = process.env.GITHUB_REF_NAME?.replace(/^v/, '') ?? manifest.version;

export default defineConfig({
  plugins: [react(), crx({ manifest: { ...manifest, version } }), tailwindcss()],
});
