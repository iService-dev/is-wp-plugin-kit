// Divi dependencies.
import {
	type Metadata,
	type ModuleLibrary,
} from '@divi/types';

// WordPress dependencies.
import { __, setLocaleData } from '@wordpress/i18n';

// Local dependencies.
import metadata from './module.json';
import defaultRenderAttributes from './module-default-render-attributes.json';
import defaultPrintedStyleAttributes from './module-default-printed-style-attributes.json';
import { ExampleModuleEdit } from './edit';
import { ExampleModuleAttrs } from './types';
import { placeholderContent } from './placeholder-content';
import { de } from './l10n';

// Styles.
import './style.scss';
import './module.scss';

const I18N_DOMAIN = 'D5_TEXTDOMAIN_PLACEHOLDER'; // is-...-plugin

// Load the translation catalog into wp.i18n for the Builder, gated by the page
// language. Divi does not run a third-party module's module.json strings through
// wp_set_script_translations in the app-window, so we register them ourselves.
if (typeof document !== 'undefined' && document.documentElement.lang.toLowerCase().startsWith('de')) {
	setLocaleData(de, I18N_DOMAIN);
}

// Run every human-facing string in the Builder metadata through __() so the
// catalog above can translate the module title, field labels/descriptions,
// option labels and group labels.
const translateMetadata = (source: Metadata.Values<ExampleModuleAttrs>): Metadata.Values<ExampleModuleAttrs> => {
	const clone = JSON.parse(JSON.stringify(source)) as any;

	if (typeof clone.title === 'string') {
		clone.title = __(clone.title, I18N_DOMAIN);
	}

	if (typeof clone.titles === 'string') {
		clone.titles = __(clone.titles, I18N_DOMAIN);
	}

	Object.values(clone.attributes ?? {}).forEach((attr: any) => {
		const item = attr?.settings?.innerContent?.item;

		if (!item) {
			return;
		}

		if (typeof item.label === 'string') {
			item.label = __(item.label, I18N_DOMAIN);
		}

		if (typeof item.description === 'string') {
			item.description = __(item.description, I18N_DOMAIN);
		}

		const options = item.component?.props?.options;

		if (options && typeof options === 'object') {
			Object.keys(options).forEach((key) => {
				const option = options[key];

				if (typeof option === 'string') {
					options[key] = __(option, I18N_DOMAIN);
				} else if (option && typeof option.label === 'string') {
					option.label = __(option.label, I18N_DOMAIN);
				}
			});
		}
	});

	// Custom settings groups (settings.groups) carry their label in the composite component.
	Object.values(clone.settings?.groups ?? {}).forEach((group: any) => {
		const groupLabel = group?.component?.props?.groupLabel;

		if (typeof groupLabel === 'string') {
		group.component.props.groupLabel = __(groupLabel, I18N_DOMAIN);
		}
	});

	return clone as Metadata.Values<ExampleModuleAttrs>;
};

// Translate the default admin label shown on the placed module in the layout.
const translateDefaults = (source: Metadata.DefaultAttributes<ExampleModuleAttrs>): Metadata.DefaultAttributes<ExampleModuleAttrs> => {
	const clone = JSON.parse(JSON.stringify(source)) as any;
	const adminLabel = clone?.module?.meta?.adminLabel?.desktop;

	if (adminLabel && typeof adminLabel.value === 'string') {
		adminLabel.value = __(adminLabel.value, I18N_DOMAIN);
	}

	return clone as Metadata.DefaultAttributes<ExampleModuleAttrs>;
};

export const exampleModule: ModuleLibrary.Module.RegisterDefinition<ExampleModuleAttrs> = {
	// Imported JSON has no inferred type, hence the type-cast.
	metadata:                 translateMetadata(metadata as Metadata.Values<ExampleModuleAttrs>),
	defaultAttrs:             translateDefaults(defaultRenderAttributes as Metadata.DefaultAttributes<ExampleModuleAttrs>),
	defaultPrintedStyleAttrs: defaultPrintedStyleAttributes as Metadata.DefaultAttributes<ExampleModuleAttrs>,
	placeholderContent,
	renderers: {
		edit: ExampleModuleEdit,
	},
};
