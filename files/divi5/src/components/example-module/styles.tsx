// External dependencies.
import React, { ReactElement } from 'react';

// Divi dependencies.
import {
	StyleContainer,
	StylesProps,
	CssStyle,
} from '@divi/module';

// Local dependencies.
import { ExampleModuleAttrs } from './types';
import { cssFields } from './custom-css';

/**
 * Example Module's style components.
 *
 * This is the VB equivalent of the PHP `module_styles()` in
 * modules/ExampleModule/ExampleModuleTrait/ModuleStylesTrait.php.
 *
 * @since ??
 */
export const ModuleStyles = ({
	attrs,
	elements,
	settings,
	orderClass,
	mode,
	state,
	noStyleTag,
}: StylesProps<ExampleModuleAttrs>): ReactElement => {
	const textSelector = `${orderClass} .is_example_module__inner`;

	return (
		<StyleContainer mode={mode} state={state} noStyleTag={noStyleTag}>
			{/* Module */}
			{elements.style({
				attrName: 'module',
				styleProps: {
					disabledOn: {
						disabledModuleVisibility: settings?.disabledModuleVisibility,
					},
					advancedStyles: [
						{
							componentName: 'divi/text',
							props: {
								selector: textSelector,
								attr: attrs?.module?.advanced?.text,
							},
						},
					],
				},
			})}

			{/* Title */}
			{elements.style({
				attrName: 'title',
			})}

			{/* Content */}
			{elements.style({
				attrName: 'content',
			})}

			{/*
			* CssStyle must be added at the very bottom so the user's custom CSS
			* can override the module styles above.
			*/}
			<CssStyle
				selector={orderClass}
				attr={attrs.css}
				cssFields={cssFields}
			/>
		</StyleContainer>
	);
};
