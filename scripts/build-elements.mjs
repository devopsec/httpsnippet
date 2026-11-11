#!/usr/bin/env node
// Builds a Stoplight Elements web-components bundle that uses this fork's request-sample
// targets. The pristine bundle is downloaded from npm (integrity-checked), the fork's
// targets are compiled from TypeScript with esbuild, and both are spliced together.
//
// Usage: npm run build:elements -- [output-path]
//        (default output: dist/elements/web-components.min.js)
// Requires `curl` and `tar` on PATH.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildSync } from 'esbuild';

const forkDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outPath = resolve(process.argv[2] ?? join(forkDir, 'dist/elements/web-components.min.js'));

const TARBALL_URL = 'https://registry.npmjs.org/@stoplight/elements/-/elements-9.0.29.tgz';
const TARBALL_INTEGRITY =
  'sha512-RJBp0RqeycP7kN/I+aIWXYU22xIuBoT4pGv2mq70Yt9ZfZ8WubjgIC5kS7RZSHzkERB/OL1/Im85lz3LpvHHmg==';
const BUNDLE_IN_TARBALL = 'package/web-components.min.js';
const PRISTINE_SHA256 = '3908d0e9f6425c9224a88d393550729a38dd4e1e49ab23609ca23382a6e941eb';

// Request-sample menu entries: menu label -> httpsnippet target and its clients
// (library label -> httpsnippet client key).
const MENU = [
  {
    label: 'Rust',
    target: 'rust',
    viewer: 'rust',
    libraries: { reqwest: 'reqwest', ureq: 'ureq', attohttpc: 'attohttpc' },
  },
  {
    label: 'Zig',
    target: 'zig',
    viewer: 'zig',
    libraries: { 'std.http fetch': 'std', 'std.http request': 'request', libcurl: 'libcurl' },
  },
  {
    label: 'C3',
    target: 'c3',
    viewer: 'c',
    libraries: { libcurl: 'libcurl', 'curl (process)': 'curl', 'std::net::tcp': 'tcp' },
  },
];

const fail = message => {
  throw new Error(`build-elements: ${message}`);
};

const replaceOnce = (source, anchor, replacement) => {
  const first = source.indexOf(anchor);
  if (first === -1) fail(`anchor not found: ${anchor.slice(0, 60)}`);
  if (source.indexOf(anchor, first + 1) !== -1)
    fail(`anchor is not unique: ${anchor.slice(0, 60)}`);
  return source.slice(0, first) + replacement + source.slice(first + anchor.length);
};

const sha256 = buffer => createHash('sha256').update(buffer).digest('hex');

const menuEntry = ({ label, target, viewer, libraries }) => {
  const libs = Object.entries(libraries)
    .map(
      ([name, client]) => `${JSON.stringify(name)}:{httpSnippetLibrary:${JSON.stringify(client)}}`,
    )
    .join(',');
  return `${label}:{mosaicCodeViewerLanguage:${JSON.stringify(
    viewer,
  )},httpSnippetLanguage:${JSON.stringify(target)},libraries:{${libs}}}`;
};

const tmp = mkdtempSync(join(tmpdir(), 'build-elements-'));
try {
  const tarball = join(tmp, 'elements.tgz');
  execFileSync('curl', ['-fsSL', '-o', tarball, TARBALL_URL], { stdio: 'inherit' });

  const integrity = `sha512-${createHash('sha512').update(readFileSync(tarball)).digest('base64')}`;
  if (integrity !== TARBALL_INTEGRITY) fail(`tarball integrity mismatch: ${integrity}`);

  execFileSync('tar', ['-xzf', tarball, '-C', tmp, BUNDLE_IN_TARBALL]);
  const pristine = readFileSync(join(tmp, BUNDLE_IN_TARBALL));
  if (sha256(pristine) !== PRISTINE_SHA256) fail('pristine bundle sha256 mismatch');

  const targets = MENU.map(entry => entry.target);
  const { outputFiles } = buildSync({
    stdin: {
      contents: targets
        .map(key => `export { ${key} } from './src/targets/${key}/target';`)
        .join('\n'),
      resolveDir: forkDir,
      loader: 'ts',
    },
    bundle: true,
    write: false,
    format: 'iife',
    globalName: 'hsTargets',
    platform: 'browser',
    target: 'es2019',
    minify: true,
    legalComments: 'none',
    logLevel: 'warning',
  });
  const targetsSource = outputFiles[0].text.trim();

  // The bundle inlines httpsnippet-lite: `MA` is its target map and the menu table lists
  // Ruby then Swift. Prepend the fork's targets and insert the menu entries between them.
  const runtime = `var __hsFork=(()=>{${targetsSource};return hsTargets;})();`;
  const targetMapEntries = targets.map(key => `${key}:__hsFork.${key},`).join('');
  const menuEntries = MENU.map(entry => `${menuEntry(entry)},`).join('');
  const ruby = 'Ruby:{mosaicCodeViewerLanguage:"ruby",httpSnippetLanguage:"ruby"},';

  let patched = pristine.toString('utf8');
  patched = replaceOnce(patched, '(()=>{var e,t,n={', `(()=>{${runtime}var e,t,n={`);
  patched = replaceOnce(patched, 'MA={', `MA={${targetMapEntries}`);
  patched = replaceOnce(patched, `${ruby}Swift:{`, `${ruby}${menuEntries}Swift:{`);

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, patched, 'utf8');
  process.stdout.write(`wrote ${outPath}\nsha256 ${sha256(Buffer.from(patched, 'utf8'))}\n`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
