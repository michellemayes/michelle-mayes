import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Blog post styles live in a global stylesheet so post windows keep their
// look when opened from any page. Markdown output carries no Astro scope
// attribute, so these rules must target its elements directly.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const stylesheet = fs.readFileSync(path.join(repoRoot, 'src/styles/apps/post.css'), 'utf8');

const requiredSelectors = [
  '.app-post .blog-post-content p',
  '.app-post .blog-post-content h2',
  '.app-post .blog-post-content h3',
  '.app-post .blog-post-content ul',
  '.app-post .blog-post-content ol',
  '.app-post .blog-post-content li',
  '.app-post .blog-post-content hr',
];

test('blog markdown content has spacing styles that reach rendered markdown', () => {
  for (const selector of requiredSelectors) {
    assert.match(stylesheet, new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[,{]`));
  }
});

test('the global post stylesheet is loaded on every page', () => {
  const head = fs.readFileSync(path.join(repoRoot, 'src/components/BaseHead.astro'), 'utf8');
  assert.match(head, /import '\.\.\/styles\/apps\/post\.css';/);
});
