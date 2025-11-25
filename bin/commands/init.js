import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { copy } from '../utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const selfPkg = require('../../package.json');

const toolkitVersion = `^${selfPkg.version}`;

export function runInit() {
	const root = process.cwd();

	// ------------------------------------------
	// 1) .gitignore kopieren
	// ------------------------------------------
	copy('gitignore');

	// ------------------------------------------
	// 2) stylelint config erzeugen
	// ------------------------------------------
	fs.writeFileSync(
		path.join(root, '.stylelintrc.json'),
		JSON.stringify(
			{
				extends: ['@iservice-dev/is-wp-plugin-kit/files/stylelintrc.json'],
			},
			null,
			2
		)
	);
	console.log('✓ Created .stylelintrc.json');

	// ------------------------------------------
	// 3) tsconfig erzeugen
	// ------------------------------------------
	fs.writeFileSync(
		path.join(root, 'tsconfig.json'),
		JSON.stringify(
			{
				extends: '@iservice-dev/is-wp-plugin-kit/files/tsconfig.json',
				include: ['assets/src/ts/**/*.ts'],
			},
			null,
			2
		)
	);
	console.log('✓ Created tsconfig.json');

	// ------------------------------------------
	// 4) oxlintrc erzeugen
	// ------------------------------------------
	fs.writeFileSync(
		path.join(root, '.oxlintrc.json'),
		JSON.stringify(
			{
				extends: ['@iservice-dev/is-wp-plugin-kit/files/oxlintrc.json'],
			},
			null,
			2
		)
	);
	console.log('✓ Created .oxlintrc.json');

	// ------------------------------------------
	// 5) postcss config erzeugen
	// ------------------------------------------
	fs.writeFileSync(
		path.join(root, 'postcss.config.cjs'),
		`module.exports = require("@iservice-dev/is-wp-plugin-kit/files/postcss.config.cjs");\n`
	);
	console.log('✓ Created postcss.config.cjs');

	// ------------------------------------------
	// 6) vite.config.ts erzeugen
	// ------------------------------------------
	fs.writeFileSync(
		path.join(root, 'vite.config.ts'),
		`import { wpPluginKitVite } from "@iservice-dev/is-wp-plugin-kit/vite";

export default wpPluginKitVite({
  port: 5500
});
`
	);
	console.log('✓ Created vite.config.ts');

	// ------------------------------------------
	// 7) package.json erzeugen (falls nicht vorhanden)
	// ------------------------------------------
	const pkgPath = path.join(root, 'package.json');

	if (!fs.existsSync(pkgPath)) {
		const pkg = {
			name: path.basename(root),
			version: '1.0.0',
			type: 'module',
			description: 'iService WordPress Plugin',
			scripts: {
				dev: 'is-wp-plugin-kit dev',
				build: 'is-wp-plugin-kit build',
			},
			devDependencies: {
				'@iservice-dev/is-wp-plugin-kit': toolkitVersion,
				vite: '^7.1.7',
			},
		};

		fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
		console.log('✓ Created package.json');
	} else {
		console.log('↺ package.json already exists – skipped');
	}

	// ------------------------------------------
	// 8) Ordnerstruktur erzeugen
	// ------------------------------------------
	const dirs = [
		'assets/src/ts',
		'assets/src/scss',
		'assets/src/fonts',
		'assets/src/images',
		'assets/src/l10n',
		'assets/src/legacy/js',
		'assets/src/legacy/css',
		'assets/dist',
		'includes/lib/Admin',
		'includes/lib/Core',
		'includes/lib/Frontend',
	];

	// Ordner die kein .gitkeep brauchen (bekommen andere Dateien)
	const skipGitkeep = ['assets/src/l10n', 'includes/lib/Core'];

	dirs.forEach((dir) => {
		const full = path.join(root, dir);
		if (!fs.existsSync(full)) {
			fs.mkdirSync(full, { recursive: true });

			if (!skipGitkeep.includes(dir)) {
				const gitkeepPath = path.join(full, '.gitkeep');
				fs.writeFileSync(gitkeepPath, '');
			}
		}
	});

	console.log('✓ Created folder structure with .gitkeep files');

	// ------------------------------------------
	// 9) de_DE.po Template kopieren
	// ------------------------------------------
	copy('de_DE.po', 'assets/src/l10n/de_DE.po');

	// ------------------------------------------
	// 10) PHP Template Files kopieren
	// ------------------------------------------
	copy('Plugin.php', 'includes/lib/Core/Plugin.php');
	copy('Config.php', 'includes/lib/Core/Config.php');

	// ------------------------------------------
	console.log('\n🎉 Project initialized successfully!\n');
	process.exit(0);
}
