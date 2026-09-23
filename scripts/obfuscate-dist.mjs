import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const distAssetsDir = join(process.cwd(), 'dist', 'assets');
const sensitiveStrings = [
  'rt_sync',
  'rt-sync',
  'rt_init',
  'submit_best_score',
  'start_score_run',
  'score_runs',
  'profiles',
  'best_score',
  'claimed_score',
  'duration_ms',
  'input_log',
  'reject_reason',
  'runId',
  'durationMs',
  'inputLog',
  'score_too_high',
  'score_mismatch',
  'run_not_found',
  'invalid_run_owner',
  'invalid_run_duration',
  'invalid_input_log',
  'stale_run',
  'not_authenticated',
  'profile_not_found'
];

function toBase64(value) {
  return Buffer.from(value, 'utf8').toString('base64');
}

function toCharCodeExpression(value) {
  return `String.fromCharCode(${[...value].map((char) => char.charCodeAt(0)).join(',')})`;
}

function toSliceExpression(value) {
  return JSON.stringify(`_${value}`).concat('.slice(1)');
}

function toJoinExpression(value) {
  const chunks = [];
  for (let index = 0; index < value.length; index += 3) {
    chunks.push(value.slice(index, index + 3));
  }
  return `[${chunks.map((chunk) => JSON.stringify(chunk)).join(',')}].join("")`;
}

function toHiddenExpression(value, index) {
  switch (index % 4) {
    case 0:
      return toCharCodeExpression(value);
    case 1:
      return `atob(${JSON.stringify(toBase64(value))})`;
    case 2:
      return toSliceExpression(value);
    default:
      return toJoinExpression(value);
  }
}

async function listJavaScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listJavaScriptFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }

  return files;
}

const replacements = sensitiveStrings.flatMap((value, index) => {
  const replacement = toHiddenExpression(value, index);
  return [
    [`"${value}"`, replacement],
    [`'${value}'`, replacement]
  ];
});
const files = await listJavaScriptFiles(distAssetsDir);
let touchedFiles = 0;
let replacementCount = 0;

for (const file of files) {
  let source = await readFile(file, 'utf8');
  let changed = false;

  for (const [needle, replacement] of replacements) {
    if (source.includes(needle)) {
      const before = source;
      source = source.split(needle).join(replacement);
      replacementCount += before.split(needle).length - 1;
      changed = true;
    }
  }

  if (changed) {
    await writeFile(file, source);
    touchedFiles += 1;
  }
}

console.log(`Obfuscated ${replacementCount} sensitive literal(s) in ${touchedFiles}/${files.length} JS bundle(s).`);
