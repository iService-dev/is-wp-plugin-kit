import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function runCompileMo() {
	const moScript = path.resolve(__dirname, '../../files/compile-mo.mjs');
	import(moScript);
	process.exit(0);
}
