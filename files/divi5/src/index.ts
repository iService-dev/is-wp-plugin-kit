import { omit } from 'lodash';

import { addAction } from '@wordpress/hooks';

import { registerModule } from '@divi/module-library';

import { exampleModule } from './components/example-module';

// Register the module(s) with the Divi 5 module library once its store is ready.
addAction('divi.moduleLibrary.registerModuleLibraryStore.after', 'D5_HOOKS_NS_PLACEHOLDER', () => {
  registerModule(exampleModule.metadata, omit(exampleModule, 'metadata'));
});
