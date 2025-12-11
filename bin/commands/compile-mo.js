import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function runCompileMo() {
	const scriptPath = path.resolve(__dirname, '../../files/compile-mo.mjs');
	
	try {
		execFileSync('node', [scriptPath], {
			stdio: 'inherit',
			cwd: process.cwd()
		});
	} catch (err) {
		console.error('❌ Error compiling .po files:', err.message);
		process.exit(1);
	}
}
