// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://michelle-mayes.vercel.app', // Update with your actual domain
  integrations: [mdx(), sitemap()],
  adapter: vercel(),
  output: 'hybrid', // Enables SSR for specific pages while keeping others static
});