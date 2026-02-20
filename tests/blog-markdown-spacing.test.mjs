import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const templatePath = '/Users/michelle/.codex/worktrees/ceb6/michelle-mayes/src/pages/blog/[...slug].astro';
const template = fs.readFileSync(templatePath, 'utf8');

const requiredGlobalSelectors = [
  '.blog-post-content :global(p)',
  '.blog-post-content :global(h2)',
  '.blog-post-content :global(h3)',
  '.blog-post-content :global(ul)',
  '.blog-post-content :global(ol)',
  '.blog-post-content :global(li)',
];

test('blog markdown content uses global selectors so spacing styles apply', () => {
  for (const selector of requiredGlobalSelectors) {
    assert.match(template, new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});
