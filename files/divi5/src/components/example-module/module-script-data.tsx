import React, {
  Fragment,
  ReactElement,
} from 'react';

import { ModuleScriptDataProps } from '@divi/module';
import { ExampleModuleAttrs } from './types';

/**
 * Example Module's script data component.
 *
 * @since ??
 *
 * @param {ModuleScriptDataProps<ExampleModuleAttrs>} props React component props.
 *
 * @returns {ReactElement}
 */
export const ModuleScriptData = ({
  elements,
}: ModuleScriptDataProps<ExampleModuleAttrs>): ReactElement => (
  <Fragment>
    {elements.scriptData({
      attrName: 'module',
    })}
  </Fragment>
);
