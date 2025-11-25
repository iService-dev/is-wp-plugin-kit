import { execSync } from 'node:child_process';

export function runDev() {
	execSync(
		'concurrently -k ' +
			'"vite" ' +
			"\"chokidar 'assets/src/ts/**/*.ts' -c 'oxlint assets/src/ts'\" " +
			"\"chokidar 'assets/src/scss/**/*.scss' -c 'stylelint \\\"assets/src/scss/**/*.scss\\\" --fix'\" " +
			"\"chokidar 'assets/src/l10n/**/*.po' -c 'is-wp-plugin-kit compile-mo'\"",
		{ stdio: 'inherit' }
	);
	process.exit(0);
}
