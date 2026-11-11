import path from 'node:path'
import fs from 'node:fs/promises'
import fg from 'fast-glob'
import gettextParser from 'gettext-parser'

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

  let mo
  try {
    mo = gettextParser.mo.compile(gettextParser.po.parse(await fs.readFile(inPath)))
  } catch (err) {
    throw new Error(`Invalid .po file ${path.relative(root, inPath)}: ${err.message}`, { cause: err })
  }
  await fs.writeFile(outPath, mo)

  console.log(`✔ ${rel} -> ${path.relative(root, outPath)} (with prefix ${pluginName}-)`)
}

console.log(`\n✅ Compiled ${poFiles.length} translation file(s)`);
