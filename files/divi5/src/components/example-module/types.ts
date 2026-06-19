// Divi dependencies.
import { ModuleEditProps } from '@divi/module-library';
import {
	FormatBreakpointStateAttr,
	InternalAttrs,
	type Element,
	type Module,
} from '@divi/types';

export interface ExampleModuleCssAttr extends Module.Css.AttributeValue {
	title?: string;
	content?: string;
}

export type ExampleModuleCssGroupAttr = FormatBreakpointStateAttr<ExampleModuleCssAttr>;

export interface ExampleModuleAttrs extends InternalAttrs {
	// Custom CSS is shared across multiple elements, so it gets its own top-level property.
	css?: ExampleModuleCssGroupAttr;

	// Module.
	module?: {
		meta?: Element.Meta.Attributes;
		advanced?: {
			link?: Element.Advanced.Link.Attributes;
			htmlAttributes?: Element.Advanced.IdClasses.Attributes;
			text?: Element.Advanced.Text.Attributes;
		};
		decoration?: Element.Decoration.PickedAttributes<
			'animation' |
			'background' |
			'border' |
			'boxShadow' |
			'disabledOn' |
			'filters' |
			'overflow' |
			'position' |
			'scroll' |
			'sizing' |
			'spacing' |
			'sticky' |
			'transform' |
			'transition' |
			'zIndex'
			> & {
			// Custom Attributes are stored at module.decoration.attributes.
			attributes?: any;
		};
	};

	// Title.
	title?: Element.Types.Title.Attributes;

	// Content.
	content?: Element.Types.Content.Attributes;
}

export type ExampleModuleEditProps = ModuleEditProps<ExampleModuleAttrs>;
