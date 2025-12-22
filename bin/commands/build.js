import { execSync } from 'node:child_process';
import { globSync } from 'glob';

export function runBuild() {

	const tsFiles = globSync('assets/src/ts/**/*.ts');
	if (tsFiles.length > 0) {
		execSync('oxlint assets/src/ts', { stdio: 'inherit' });
	}

	const scssFiles = globSync('assets/src/scss/**/*.scss');
	if (scssFiles.length > 0) {
		execSync('stylelint "assets/src/scss/**/*.scss" --fix', { stdio: 'inherit' });
	}

	execSync('vite build', { stdio: 'inherit' });
	execSync('is-wp-plugin-kit compile-mo', { stdio: 'inherit' });

	console.log('✓ Build completed');
	process.exit(0);
}
