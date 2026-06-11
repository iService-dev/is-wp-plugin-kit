import { execSync } from 'node:child_process';
import fs from 'node:fs';

export async function runDev() {
	const { globSync } = await import('glob');

	const commands = ['"vite"'];

	const tsFiles = globSync('assets/src/ts/**/*.ts');
	if (tsFiles.length > 0) {
		commands.push("\"chokidar 'assets/src/ts/**/*.ts' -c 'oxlint assets/src/ts'\"");
	}

	const scssFiles = globSync('assets/src/scss/**/*.scss');
	if (scssFiles.length > 0) {
		commands.push(
			'"chokidar \'assets/src/scss/**/*.scss\' -c \'stylelint \\"assets/src/scss/**/*.scss\\" --fix\'"'
		);
	}
	commands.push("\"chokidar 'assets/src/l10n/**/*.po' -c 'is-wp-plugin-kit compile-mo'\"");

	// Divi 5 module (optional): run its webpack watcher alongside the Vite dev server.
	if (fs.existsSync('divi5/package.json')) {
		commands.push('"cd divi5 && npm run start"');
	}

	execSync(`concurrently -k ${commands.join(' ')}`, { stdio: 'inherit' });
	process.exit(0);
}
