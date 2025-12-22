import { execSync } from 'node:child_process';

export async function runBuild() {
	const { globSync } = await import('glob');

	const tsFiles = globSync('assets/src/ts/**/*.ts');
	if (tsFiles.length > 0) {
		execSync('oxlint assets/src/ts', { stdio: 'inherit' });
	} else {
		console.log('↺ No TypeScript files found, skipping oxlint');
	}

	const scssFiles = globSync('assets/src/scss/**/*.scss');
	if (scssFiles.length > 0) {
		execSync('stylelint "assets/src/scss/**/*.scss" --fix', { stdio: 'inherit' });
	} else {
		console.log('↺ No SCSS files found, skipping stylelint');
	}

	if (tsFiles.length > 0 || scssFiles.length > 0) {
		execSync('vite build', { stdio: 'inherit' });
	} else {
		console.log('↺ No source files found, skipping Vite build');
	}

	execSync('is-wp-plugin-kit compile-mo', { stdio: 'inherit' });

	console.log('✓ Build completed');
	process.exit(0);
}
