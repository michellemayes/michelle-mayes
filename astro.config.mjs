// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://michellemayes.me',
  integrations: [mdx(), sitemap()],
  adapter: vercel(),
  // Inline all CSS so each page paints as soon as its HTML arrives, with no
  // render-blocking stylesheet request between page navigations.
  build: { inlineStylesheets: 'always' },
  // Fetch pages on hover so clicking the menu bar or dock feels instant.
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  output: 'server', // Enables SSR for dynamic pages
});