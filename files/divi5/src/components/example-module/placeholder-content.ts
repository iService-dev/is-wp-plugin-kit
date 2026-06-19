// Divi dependencies.
import { placeholderContent as placeholder } from '@divi/module-utils';

// Local dependencies.
import { ExampleModuleAttrs } from './types';

// Content shown when the module is first dropped onto the page.
export const placeholderContent: ExampleModuleAttrs = {
	title: {
		innerContent: {
			desktop: {
				value: placeholder.title,
			},
		},
	},
	content: {
		innerContent: {
			desktop: {
				value: placeholder.body,
			},
		},
	},
};
