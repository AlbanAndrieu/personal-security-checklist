import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as yaml from 'js-yaml';

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = resolve(webRoot, '..');
const read = (path) => readFileSync(resolve(webRoot, path), 'utf8');

const vercel = JSON.parse(read('vercel.json'));
const pkg = JSON.parse(read('package.json'));

// A Vercel CLI deploy must NOT accidentally invoke the Qwik Edge adapter.
assert.equal(vercel.framework, 'vite');
assert.equal(vercel.buildCommand, 'yarn build.ssg');
assert.equal(vercel.outputDirectory, 'dist');
assert.equal(pkg.scripts.build, 'yarn build.ssg');
assert.match(pkg.scripts['build.ssg'], /adapters\/static\/vite\.config\.mts/);
assert.doesNotMatch(pkg.scripts.build, /build\.server|vercel-edge|qwik build/);

const dist = resolve(webRoot, 'dist');
const checklists = yaml.load(readFileSync(resolve(sourceRoot, 'personal-security-checklist.yml'), 'utf8'));
assert.ok(Array.isArray(checklists) && checklists.length > 0, 'Expected checklist sections');
const articles = read('src/data/articles.ts');
const articleSlugs = [...articles.matchAll(/^\s+slug:\s*'([^']+)'/gm)].map((match) => match[1]);
assert.ok(articleSlugs.length > 0, 'Expected known article slugs');

const paths = [
  'index.html',
  '404.html',
  'sitemap.xml',
  'about/index.html',
  'checklist/index.html',
  'article/index.html',
  ...checklists.map((section) => `checklist/${section.slug}/index.html`),
  ...articleSlugs.map((slug) => `article/${slug}/index.html`),
];
assert.equal(new Set(paths).size, paths.length, 'Duplicate generated route');
for (const path of paths) {
  const file = resolve(dist, path);
  assert.ok(existsSync(file), `Missing static page: ${path}`);
  assert.ok(statSync(file).isFile() && statSync(file).size > 0, `Empty static page: ${path}`);
}

assert.equal(
  existsSync(resolve(webRoot, '.vercel/output/functions')),
  false,
  'Vercel runtime functions must not be produced by SSG',
);
console.log(`Verified ${paths.length} SSG artifacts; zero generated Vercel Functions.`);
