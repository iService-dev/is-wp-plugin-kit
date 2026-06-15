#!/usr/bin/env node

import { runInit } from './commands/init.js';
import { runDev } from './commands/dev.js';
import { runBuild } from './commands/build.js';
import { runCompileMo } from './commands/compile-mo.js';
import { runAddDivi5 } from './commands/add-divi5.js';

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
	case 'add-divi5':
		runAddDivi5();
		break;

	default:
		console.log(`
is-wp-plugin-kit – available commands:

  init             → Setup a new plugin project
  dev              → Run vite + watchers
  build            → Production build
  compile-mo       → Convert .po → .mo
  add-divi5        → Scaffold a Divi 5 module bundle (divi5/)
`);
}
