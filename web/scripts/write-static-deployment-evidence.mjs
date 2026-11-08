import { mkdir, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const homepage = await stat(resolve(dist, 'index.html'));
if (!homepage.isFile() || homepage.size === 0) {
  throw new Error('SSG output missing: index.html');
}

// This marker is generated at build time, never by a Vercel Function.
// Public commit identifiers are safe; credentials and environment names are not.
const rawSha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || '';
const commit = /^[0-9a-f]{40}$/.test(rawSha) ? rawSha : null;
const marker = {
  schemaVersion: 1,
  project: 'checklist',
  rendering: 'static',
  commit,
};
const output = resolve(dist, '.well-known', 'checklist-build.json');
await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(marker, null, 2)}\n`, 'utf8');
console.log('Static deployment marker generated in dist/.well-known/checklist-build.json');
