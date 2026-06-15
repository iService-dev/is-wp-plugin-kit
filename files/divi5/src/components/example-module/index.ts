// Divi dependencies.
import {
  type Metadata,
  type ModuleLibrary,
} from '@divi/types';

// Local dependencies.
import metadata from './module.json';
import defaultRenderAttributes from './module-default-render-attributes.json';
import defaultPrintedStyleAttributes from './module-default-printed-style-attributes.json';
import { ExampleModuleEdit } from './edit';
import { ExampleModuleAttrs } from './types';
import { placeholderContent } from './placeholder-content';

// Styles.
import './style.scss';
import './module.scss';

export const exampleModule: ModuleLibrary.Module.RegisterDefinition<ExampleModuleAttrs> = {
  // Imported JSON has no inferred type, hence the type-cast.
  metadata:                 metadata as Metadata.Values<ExampleModuleAttrs>,
  defaultAttrs:             defaultRenderAttributes as Metadata.DefaultAttributes<ExampleModuleAttrs>,
  defaultPrintedStyleAttrs: defaultPrintedStyleAttributes as Metadata.DefaultAttributes<ExampleModuleAttrs>,
  placeholderContent,
  renderers: {
    edit: ExampleModuleEdit,
  },
};
