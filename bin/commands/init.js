import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline';
import { copy } from '../utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const selfPkg = require('../../package.json');

const toolkitVersion = `^${selfPkg.version}`;
const defaultWpVersion = '6.5';
const defaultPhpVersion = '8.3';
const defaultBaseVersion = '1.0.16';

function prompt(question) {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			rl.close();
			resolve(answer);
		});
	});
}

function isValidVersion(version) {
	return /^\d+(\.\d+){0,2}$/.test(version);
}

async function promptVersion(question, defaultValue) {
	while (true) {
		const answer = await prompt(question);
		const version = answer || defaultValue;
		
		if (isValidVersion(version)) {
			return version;
		}
		
		console.error(`❌ Invalid version format: "${version}". Use format like: 1.0.0, 6.5, or 8.3`);
	}
}

export async function runInit() {
	const root = process.cwd();
	const folderName = path.basename(root);

	// ------------------------------------------
	// Prompts for plugin configuration
	// ------------------------------------------
	console.log('\n🚀 is-wp-plugin-kit initialization\n');

	const pluginName = await prompt(`Plugin Name (e.g., My Awesome Plugin): `);
	if (!pluginName) {
		console.error('❌ Plugin Name is required!');
		process.exit(1);
	}

	const pluginDescr = await prompt('Plugin Description (optional): ');

	const pluginSlug =
		(await prompt(
			`Plugin Slug (default: ${folderName.toLowerCase().replace(/\s+/g, '-')}): `
		)) || folderName.toLowerCase().replace(/\s+/g, '-');

	const pluginTypeInput = await prompt(
		'Plugin Type - [1] General (requires IS Base) or [2] Standalone (default: 1): '
	);
	const pluginType = pluginTypeInput === '2' ? 'standalone' : 'general';

	const namespace = await prompt('Namespace (e.g., IS\\MyPlugin): ');
	if (!namespace) {
		console.error('❌ Namespace is required!');
		process.exit(1);
	}

	const githubRepo = await prompt('GitHub Repository URL (e.g., https://github.com/user/repo): ');
	if (!githubRepo) {
		console.error('❌ GitHub Repository URL is required!');
		process.exit(1);
	}

	const textDomain = (await prompt(`Text Domain (default: ${pluginSlug}): `)) || pluginSlug;
	const vitePort = (await prompt('Vite Dev Port (default: 5500): ')) || '5500';

	// Read correct template based on plugin type
	const pluginRootTemplateFile = pluginType === 'standalone' ? 'plugin-root-standalone.php' : 'plugin-root.php';
	const pluginRootTemplate = fs.readFileSync(
		path.join(__dirname, '../../files', pluginRootTemplateFile),
		'utf-8'
	);

	const requiredWpVersion = await promptVersion(
		`Required WordPress version (default: ${defaultWpVersion}): `,
		defaultWpVersion
	);
	const requiredPhpVersion = await promptVersion(
		`Required PHP version (default: ${defaultPhpVersion}): `,
		defaultPhpVersion
	);
	const requiredBaseVersion =
		pluginType === 'general'
			? await promptVersion(
					`Required IS Base Plugin version (default: ${defaultBaseVersion}): `,
					defaultBaseVersion
			  )
			: null;

	console.log('\n');

	// ------------------------------------------
	// 1) copy .gitignore
	// ------------------------------------------
	copy('gitignore');

	// ------------------------------------------
	// 2) create stylelint config
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
	// 3) create tsconfig
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
	// 4) create oxlintrc
	// ------------------------------------------
	fs.writeFileSync(
		path.join(root, '.oxlintrc.json'),
		JSON.stringify(
			{
				extends: ['./node_modules/@iservice-dev/is-wp-plugin-kit/files/oxlintrc.json'],
			},
			null,
			2
		)
	);
	console.log('✓ Created .oxlintrc.json');

	// ------------------------------------------
	// 5) create postcss config
	// ------------------------------------------
	fs.writeFileSync(
		path.join(root, 'postcss.config.cjs'),
		`module.exports = require("@iservice-dev/is-wp-plugin-kit/files/postcss.config.cjs");\n`
	);
	console.log('✓ Created postcss.config.cjs');

	// ------------------------------------------
	// 6) create vite.config.ts
	// ------------------------------------------
	fs.writeFileSync(
		path.join(root, 'vite.config.ts'),
		`
		import { wpPluginKitVite } from "@iservice-dev/is-wp-plugin-kit/vite";
		export default wpPluginKitVite({
		port: ${vitePort}
		});
		`
	);
	console.log('✓ Created vite.config.ts');

	// ------------------------------------------
	// 7) create package.json
	// ------------------------------------------
	const pkgPath = path.join(root, 'package.json');

	if (!fs.existsSync(pkgPath)) {
		const pkg = {
			name: pluginSlug,
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
	// 8) create folder structure
	// ------------------------------------------
	const dirs = [
		'assets/src/ts',
		'assets/src/scss',
		'assets/src/fonts',
		'assets/src/images',
		'assets/src/l10n',
		'assets/src/legacy/js',
		'assets/src/legacy/css',
		'includes/lib/Admin',
		'includes/lib/Core',
		'includes/lib/Frontend',
	];

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
	// 9) copy de_DE.po template
	// ------------------------------------------
	copy('de_DE.po', 'assets/src/l10n/de_DE.po');

	// ------------------------------------------
	// 10) create GitHub Actions workflow
	// ------------------------------------------
	const workflowDir = path.join(root, '.github/workflows');
	if (!fs.existsSync(workflowDir)) {
		fs.mkdirSync(workflowDir, { recursive: true });
	}

	const deployYmlTemplate = fs.readFileSync(
		path.join(__dirname, '../../files/deploy.yml'),
		'utf-8'
	);

	const deployYmlContent = deployYmlTemplate.replace(/\[plugin-placehoder\]/g, pluginSlug);

	fs.writeFileSync(path.join(workflowDir, 'deploy.yml'), deployYmlContent);
	console.log('✓ Created .github/workflows/deploy.yml');

	// ------------------------------------------
	// 11) create and customize PHP template files
	// ------------------------------------------

	const pluginRootFile = `${pluginSlug}.php`;

	const namespaceParts = namespace.split('\\').filter(Boolean);
	const namespaceFirst = namespaceParts[0] || 'IS';
	const namespaceSecond = namespaceParts[1] || 'Plugin';

	const pluginRootContent = pluginRootTemplate
		.replace(/\[Plugin Name Placeholder\]/g, `${pluginName}`)
		.replace(/\[Plugin Description Placeholder\]/g, `${pluginDescr || '-'}`)
		.replace(/\[text-domain-placeholder\]/g, `${textDomain}`)
		.replace(/plugin_slug_placeholder/g, pluginSlug.replace(/-/g, '_'))
		.replace(/\[NamespacePlaceholder\]/g, namespaceSecond)
		.replace(/\\NamespacePlaceholder\\/g, `\\${namespace}\\`)
		.replace(/define\('PLUGIN_TYPE', 'general'\);/g, `define('PLUGIN_TYPE', '${pluginType}');`)
		.replace(/\[base-version-placeholder\]';/g, `'${requiredBaseVersion}'`)
		.replace(/\[wp-version-placeholder\]';/g, `'${requiredWpVersion}'`)
		.replace(/\[php-version-placeholder\]';/g, `'${requiredPhpVersion}'`);

	fs.writeFileSync(path.join(root, pluginRootFile), pluginRootContent);
	console.log(`✓ Created ${pluginRootFile}`);

	if (pluginType === 'general') {
		// Plugin.php
		const pluginPhpTemplate = fs.readFileSync(
			path.join(__dirname, '../../files/Plugin.php'),
			'utf-8'
		);

		const pluginPhpContent = pluginPhpTemplate
			.replace(/NamespacePlaceholder/g, `${namespace}`)
			.replace(/'\[github-repo-placeholder\]'/g, `'${githubRepo}'`)
			.replace(/'\[plugin-slug-placeholder\]'/g, `'${pluginSlug}'`)

		fs.writeFileSync(path.join(root, 'includes/lib/Core/Plugin.php'), pluginPhpContent);
		console.log('✓ Created includes/lib/Core/Plugin.php');

		// Config.php
		const configPhpTemplate = fs.readFileSync(
			path.join(__dirname, '../../files/Config.php'),
			'utf-8'
		);

		const configPhpContent = configPhpTemplate
			.replace(/NamespacePlaceholder/g, `${namespace}\\Core;`)
			.replace(/\[plugin-slug-placeholder\]/g, `${pluginSlug}`)
			.replace(/\$this->vitePort = 5500;/g, `$this->vitePort = ${vitePort};`)

		fs.writeFileSync(path.join(root, 'includes/lib/Core/Config.php'), configPhpContent);
		console.log('✓ Created includes/lib/Core/Config.php');
	} else {
		console.log('↺ Plugin.php and Config.php skipped (standalone plugin - add your own code)');
	}

	// ------------------------------------------
	console.log('\n🎉 Project initialized successfully!\n');
	console.log(`Plugin: ${pluginName}`);
	console.log(`Type: ${pluginType}`);
	console.log(`Slug: ${pluginSlug}`);
	console.log(`Namespace: ${namespace}`);
	console.log(`Text Domain: ${textDomain}`);
	console.log(`Vite Port: ${vitePort}\n`);
	process.exit(0);
}
