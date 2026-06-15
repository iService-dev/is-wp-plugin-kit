import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = path.resolve(__dirname, '../../files/divi5');

/**
 * Parse `--key value` / `--key=value` flags from argv. Lets the command run
 * non-interactively (scripts, CI, tests); any flag not supplied is prompted for.
 */
function parseFlags(argv) {
	const flags = {};
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (!arg.startsWith('--')) continue;
		const eq = arg.indexOf('=');
		if (eq !== -1) {
			flags[arg.slice(2, eq)] = arg.slice(eq + 1);
		} else {
			const next = argv[i + 1];
			flags[arg.slice(2)] = next && !next.startsWith('--') ? (i++, next) : true;
		}
	}
	return flags;
}

/**
 * Create one readline interface for the whole run. Reusing a single interface
 * (instead of one per question) keeps buffered lines intact between questions.
 */
function makePrompter() {
	const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
	const ask = (question) => new Promise((resolve) => rl.question(question, resolve));
	return { ask, close: () => rl.close() };
}

/**
 * Best-effort detection of the plugin's PHP namespace by reading the autoloader
 * call in the plugin's main file, e.g. `new \IS\Autoloader('Website', ...)`
 * combined with the `namespace` declared in includes/lib/Core/Config.php.
 */
function detectNamespace(root) {
	const configPath = path.join(root, 'includes/lib/Core/Config.php');
	if (fs.existsSync(configPath)) {
		const src = fs.readFileSync(configPath, 'utf8');
		const m = src.match(/namespace\s+([A-Za-z0-9_\\]+)\\Core\s*;/);
		if (m) return m[1]; // e.g. "IS\Website"
	}
	return '';
}

function detectSlug(root) {
	const pkgPath = path.join(root, 'package.json');
	if (fs.existsSync(pkgPath)) {
		try {
			const name = JSON.parse(fs.readFileSync(pkgPath, 'utf8')).name;
			if (name) return name;
		} catch {
			/* ignore */
		}
	}
	return path.basename(root).toLowerCase().replace(/\s+/g, '-');
}

/** Recursively copy the template tree, substituting placeholders per file. */
function copyTemplate(srcDir, destDir, replace) {
	fs.mkdirSync(destDir, { recursive: true });
	for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
		const src = path.join(srcDir, entry.name);
		// npm strips dotfiles on publish, so the template ships `gitignore`
		// (no dot); restore the leading dot when scaffolding.
		const destName = entry.name === 'gitignore' ? '.gitignore' : entry.name;
		const dest = path.join(destDir, destName);
		if (entry.isDirectory()) {
			copyTemplate(src, dest, replace);
		} else {
			fs.writeFileSync(dest, replace(fs.readFileSync(src, 'utf8'), dest));
		}
	}
}

export async function runAddDivi5() {
	const root = process.cwd();
	const destDir = path.join(root, 'divi5');

	if (!fs.existsSync(TEMPLATE_DIR)) {
		console.error(`❌ Template not found at ${TEMPLATE_DIR}`);
		process.exit(1);
	}

	if (fs.existsSync(destDir)) {
		console.error('❌ A divi5/ folder already exists here. Remove it first or add modules manually.');
		process.exit(1);
	}

	console.log('\n🧩 Add a Divi 5 module bundle\n');

	const flags = parseFlags(process.argv.slice(3));
	// A flag passed without a value (e.g. `--namespace --slug x`) parses to the
	// boolean `true`; treat those as "not provided" so we never call string
	// methods on a boolean.
	const flagStr = (key) => (typeof flags[key] === 'string' ? flags[key] : '');
	const detectedNs = detectNamespace(root);
	const detectedSlug = detectSlug(root);

	// Resolution order for each value: an explicit flag wins, otherwise the
	// auto-detected value is used as-is (no prompt — the Divi 5 module namespace
	// is always a sub-namespace of the plugin, so there is nothing to choose).
	// We only fall back to an interactive prompt when nothing could be detected,
	// and never prompt under --yes. The prompter is created lazily so the normal
	// (fully-detected) flow stays non-interactive.
	let prompter = null;
	const ask = async (question) => {
		if (flags.yes) return '';
		if (!prompter) prompter = makePrompter();
		return (await prompter.ask(question)).trim();
	};

	const namespace =
		flagStr('namespace') || detectedNs || (await ask('Plugin namespace (e.g. IS\\MyPlugin): '));
	if (!namespace) {
		if (prompter) prompter.close();
		console.error('❌ Namespace could not be detected (pass --namespace "IS\\MyPlugin").');
		process.exit(1);
	}

	const slug = flagStr('slug') || detectedSlug || (await ask('Plugin slug: '));
	const textDomain = flagStr('text-domain') || slug;
	if (prompter) prompter.close();

	console.log(`Using namespace ${namespace}, slug ${slug}, text domain ${textDomain}.\n`);

	// Derived values
	const constPrefix = slug.toUpperCase().replace(/[^A-Z0-9]+/g, '_') + '_D5';
	const assetHandle = `${slug}-d5`;
	const pkgName = `${slug}-divi5`;
	const nsRaw = namespace.replace(/\\+$/, ''); // trim trailing backslash if any
	const nsEscaped = nsRaw.replace(/\\/g, '\\\\'); // for string literals / JSON

	// D5_NS_ESCAPED_PLACEHOLDER must be replaced before D5_NS_PLACEHOLDER,
	// since the former contains the latter as a prefix.
	const replace = (content) =>
		content
			.split('D5_NS_ESCAPED_PLACEHOLDER').join(nsEscaped)
			.split('D5_NS_PLACEHOLDER').join(nsRaw)
			.split('D5_CONST_PLACEHOLDER').join(constPrefix)
			.split('D5_HANDLE_PLACEHOLDER').join(assetHandle)
			.split('D5_PKG_PLACEHOLDER').join(pkgName)
			.split('D5_TEXTDOMAIN_PLACEHOLDER').join(textDomain);

	copyTemplate(TEMPLATE_DIR, destDir, replace);

	console.log(`\n✓ Created divi5/ (namespace ${nsRaw}\\Divi5, handle ${assetHandle})`);
	console.log('\n🎉 Divi 5 module bundle added!\n');
	console.log('Next steps:');
	console.log('  npm run build      # builds the plugin + divi5/ (installs its deps first time)');
	console.log('  npm run dev        # watches everything, divi5/ included\n');
	console.log('Both root commands drive divi5/ automatically — no separate cd/install needed.');
	console.log('The base plugin auto-loads divi5/bootstrap.php — no wiring needed.');
	console.log('Duplicate src/components/example-module + modules/ExampleModule to add more.\n');
	process.exit(0);
}
