import path from 'node:path';
import { listIcons, validateIcon, OWN_ICON_DIR, SHARED_ICON_DIR } from '../../vite/icons.js';

/**
 * Checks every SVG in assets/src/images/icons/ (and shared-icons/ in the base plugin)
 * against the kit rules. Exits with code 1 when an icon breaks them.
 */
export function runCheckIcons({ exit = true } = {}) {
	const cwd = process.cwd();
	const files = [OWN_ICON_DIR, SHARED_ICON_DIR].flatMap((dir) => listIcons(path.resolve(cwd, dir)));

	if (files.length === 0) {
		console.log('↺ No SVG icons found, skipping icon check');
		return true;
	}

	const failures = files
		.map((file) => ({ file: path.relative(cwd, file), problems: validateIcon(file) }))
		.filter((r) => r.problems.length);

	if (failures.length) {
		console.error(`✗ ${failures.length} of ${files.length} icons break the icon rules (AGENTS.md §4):`);
		for (const { file, problems } of failures) {
			console.error(`  ${file}`);
			problems.forEach((p) => console.error(`    - ${p}`));
		}
		if (exit) process.exit(1);
		return false;
	}

	console.log(`✓ ${files.length} icons checked`);
	return true;
}
