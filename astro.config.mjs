// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://michellemayes.me',
  integrations: [
    mdx(),
    // Keep the /designs prototypes out of the sitemap; they are noindex review pages.
    sitemap({ filter: (page) => !new URL(page).pathname.startsWith('/designs') }),
  ],
  adapter: vercel(),
  output: 'server', // Enables SSR for dynamic pages
});