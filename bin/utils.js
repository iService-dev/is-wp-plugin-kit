import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Safely copy a file from the files directory to the current working directory
 * @param {string} file - The filename to copy
 */
export function copy(file) {
	try {
		const src = path.resolve(__dirname, '../files', file);
		const dest = path.resolve(
			process.cwd(),
			file.replace(/^gitignore$/, '.gitignore')
		);

		if (!fs.existsSync(src)) {
			console.error(`Error: Source file ${file} not found.`);
			process.exit(1);
		}

		fs.copyFileSync(src, dest);
		console.log(`✓ Copied ${file}`);
	} catch (error) {
		console.error(`Error copying ${file}:`, error.message);
		process.exit(1);
	}
}
