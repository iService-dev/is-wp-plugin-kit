// WordPress dependencies.
import { __ } from '@wordpress/i18n';
import metadata from './module.json';

const customCssFields = metadata.customCssFields as Record<
	'title' | 'content',
	{ subName: string; selector?: string; selectorSuffix: string; label: string }
>;

customCssFields.title.label   = __('Title', 'D5_TEXTDOMAIN_PLACEHOLDER');
customCssFields.content.label = __('Content', 'D5_TEXTDOMAIN_PLACEHOLDER');

export const cssFields = { ...customCssFields };
