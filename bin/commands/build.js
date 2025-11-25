import { execSync } from 'node:child_process';

export function runBuild() {
	execSync('oxlint assets/src/ts', { stdio: 'inherit' });
	execSync('stylelint "assets/src/scss/**/*.scss" --fix', { stdio: 'inherit' });
	execSync('vite build', { stdio: 'inherit' });
	execSync('is-wp-plugin-kit compile-mo', { stdio: 'inherit' });

	console.log('✓ Build completed');
	process.exit(0);
}
