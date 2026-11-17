import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const selfPkg = require('../../package.json');

// Overwrites the plugin's AGENTS.md with the one from this kit version.
// AGENTS.md belongs to the kit; plugin-specific notes live in PLUGIN.md,
// which is never touched.
export function runUpdateAgents() {
	const root = process.cwd();

	const isPluginRoot = fs
		.readdirSync(root)
		.filter((file) => file.endsWith('.php'))
		.some((file) => /Plugin Name:/.test(fs.readFileSync(path.join(root, file), 'utf8').slice(0, 2000)));

	if (!isPluginRoot) {
		console.error('❌ No plugin main file found here. Run this in the plugin root folder.');
		process.exit(1);
	}

	const src = path.resolve(__dirname, '../../files/AGENTS.md');
	const dest = path.join(root, 'AGENTS.md');
	const latest = fs.readFileSync(src, 'utf8');
	const current = fs.existsSync(dest) ? fs.readFileSync(dest, 'utf8') : null;

	if (current === latest) {
		console.log(`✓ AGENTS.md is up to date (kit ${selfPkg.version}).`);
		return;
	}

	fs.writeFileSync(dest, latest);
	console.log(
		current === null
			? `✓ Created AGENTS.md (kit ${selfPkg.version}).`
			: `↻ AGENTS.md updated to kit ${selfPkg.version}. Re-read it before you continue.`
	);
}
