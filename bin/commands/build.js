import { execSync } from 'node:child_process';
import fs from 'node:fs';

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

	// Divi 5 module (optional): a self-contained divi5/ workspace with its own webpack build. 
	// Build it when present so its bundle ships alongside the Vite assets.
	if (fs.existsSync('divi5/package.json')) {
		if (!fs.existsSync('divi5/node_modules')) {
			console.log('▸ Installing Divi 5 module dependencies…');
			execSync('npm install', { cwd: 'divi5', stdio: 'inherit' });
		}
		console.log('▸ Building Divi 5 module…');
		execSync('npm run build', { cwd: 'divi5', stdio: 'inherit' });
	} else {
		console.log('↺ No divi5/ module found, skipping Divi 5 build');
	}

	console.log('✓ Build completed');
	process.exit(0);
}
