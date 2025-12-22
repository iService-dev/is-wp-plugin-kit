import { execSync } from 'node:child_process';
import { globSync } from 'glob';

export function runDev() {
	const commands = ['"vite"'];

	const tsFiles = globSync('assets/src/ts/**/*.ts');
	if (tsFiles.length > 0) {
		commands.push("\"chokidar 'assets/src/ts/**/*.ts' -c 'oxlint assets/src/ts'\"");
	}

	const scssFiles = globSync('assets/src/scss/**/*.scss');
	if (scssFiles.length > 0) {
		commands.push("\"chokidar 'assets/src/scss/**/*.scss' -c 'stylelint \\\"assets/src/scss/**/*.scss\\\" --fix'\"");
	}
	commands.push("\"chokidar 'assets/src/l10n/**/*.po' -c 'is-wp-plugin-kit compile-mo'\"");

	execSync(`concurrently -k ${commands.join(' ')}`, { stdio: 'inherit' });
	process.exit(0);
}
