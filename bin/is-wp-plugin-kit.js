#!/usr/bin/env node

import { runInit } from './commands/init.js';
import { runDev } from './commands/dev.js';
import { runBuild } from './commands/build.js';
import { runCompileMo } from './commands/compile-mo.js';

const cmd = process.argv[2];

switch (cmd) {
	case 'init':
		runInit();
		break;
	case 'dev':
		runDev();
		break;
	case 'build':
		runBuild();
		break;
	case 'compile-mo':
		runCompileMo();
		break;

	default:
		console.log(`
is-wp-plugin-kit – available commands:

  init             → Setup a new plugin project
  dev              → Run vite + watchers
  build            → Production build
  compile-mo       → Convert .po → .mo
`);
}
