// External dependencies.
import React, { ReactElement } from 'react';

// Divi dependencies.
import { ModuleContainer } from '@divi/module';

// Local dependencies.
import { ExampleModuleEditProps } from './types';
import { ModuleStyles } from './styles';
import { moduleClassnames } from './module-classnames';
import { ModuleScriptData } from './module-script-data';

/**
 * Example Module edit component for the Visual Builder.
 *
 * @since ??
 *
 * @param {ExampleModuleEditProps} props React component props.
 *
 * @returns {ReactElement}
 */
export const ExampleModuleEdit = (props: ExampleModuleEditProps): ReactElement => {
  const {
    attrs,
    elements,
    id,
    name,
  } = props;

  return (
    <ModuleContainer
      attrs={attrs}
      elements={elements}
      id={id}
      name={name}
      stylesComponent={ModuleStyles}
      classnamesFunction={moduleClassnames}
      scriptDataComponent={ModuleScriptData}
    >
      {elements.styleComponents({
        attrName: 'module',
      })}
      <div className="is_example_module__inner">
        {elements.render({
          attrName: 'title',
        })}
        <div className="is_example_module__content">
          {elements.render({
            attrName: 'content',
          })}
        </div>
      </div>
    </ModuleContainer>
  );
};
