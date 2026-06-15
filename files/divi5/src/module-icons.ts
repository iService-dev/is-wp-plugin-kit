import { addFilter } from '@wordpress/hooks';

import { moduleExample } from './icons';

// Add our module icon(s) to Divi's icon library.
addFilter('divi.iconLibrary.icon.map', 'isImages', (icons) => ({
  ...icons, // Important: keep the existing icons, otherwise they get overwritten.
  [moduleExample.name]: moduleExample,
}));
