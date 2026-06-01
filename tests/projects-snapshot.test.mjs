import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const snapshotPath = path.join(repoRoot, 'src/data/projects-snapshot.json');
const projectsLibPath = path.join(repoRoot, 'src/lib/projects.ts');
const projectsPagePath = path.join(repoRoot, 'src/pages/projects.astro');

const requiredFields = [
  'id',
  'name',
  'full_name',
  'description',
  'html_url',
  'language',
  'stargazers_count',
  'forks_count',
  'updated_at',
  'created_at',
  'topics',
  'fork',
  'private',
  'homepage',
];

test('projects snapshot exists and contains usable repositories', () => {
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  assert.ok(Array.isArray(snapshot), 'snapshot must be an array');
  assert.ok(snapshot.length > 0, 'snapshot must not be empty so the page never blanks');

  for (const repo of snapshot) {
    for (const field of requiredFields) {
      assert.ok(field in repo, `snapshot repo "${repo.name}" is missing field "${field}"`);
    }
    assert.equal(repo.private, false, 'snapshot must not expose private repositories');
    assert.equal(repo.fork, false, 'snapshot must not include forked repositories');
  }
});

test('projects lib falls back to the snapshot when the live fetch is empty', () => {
  const lib = fs.readFileSync(projectsLibPath, 'utf8');
  assert.match(lib, /export async function loadRepositories/);
  assert.match(lib, /projects-snapshot\.json/);
});

test('projects page uses the resilient loader, not the raw fetch', () => {
  const page = fs.readFileSync(projectsPagePath, 'utf8');
  assert.match(page, /loadRepositories/);
  assert.doesNotMatch(page, /fetchRepositories/);
});
