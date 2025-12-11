import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import fg from 'fast-glob'

const execFileP = promisify(execFile);

const root = process.cwd();

const srcDir = path.join(root, 'assets', 'src', 'l10n');
const outDir = path.join(root, 'languages');

const pluginName = path.basename(root);

await fs.mkdir(outDir, { recursive: true });
const poFiles = await fg('**/*.po', { cwd: srcDir });

if (poFiles.length === 0) {
  console.log('⚠ No .po files found in', srcDir);
  process.exit(0);
}

for (const rel of poFiles) {
  const inPath = path.join(srcDir, rel)
  const outSubdir = path.dirname(rel)
  const locale = path.basename(rel, '.po');
  const outBase = `${pluginName}-${locale}.mo`;
  const outFullDir = path.join(outDir, outSubdir)
  const outPath = path.join(outFullDir, outBase)
  await fs.mkdir(outFullDir, { recursive: true })

  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx'
  await execFileP(npxCmd, ['po2mo', inPath])

  const generatedPath = path.join(srcDir, outSubdir, locale + '.mo')
  await fs.rename(generatedPath, outPath)

  console.log(`✔ ${rel} -> ${path.relative(root, outPath)} (with prefix ${pluginName}-)`)
}

console.log(`\n✅ Compiled ${poFiles.length} translation file(s)`);
