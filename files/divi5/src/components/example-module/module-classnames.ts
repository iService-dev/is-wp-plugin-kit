import { ModuleClassnamesParams, textOptionsClassnames } from '@divi/module';
import { ExampleModuleAttrs } from './types';

/**
 * Module classnames function for the Example Module.
 *
 * This is the VB equivalent of the PHP `module_classnames()` in
 * modules/ExampleModule/ExampleModuleTrait/ModuleClassnamesTrait.php.
 *
 * @since ??
 *
 * @param {ModuleClassnamesParams<ExampleModuleAttrs>} param0 Function parameters.
 */
export const moduleClassnames = ({
  classnamesInstance,
  attrs,
}: ModuleClassnamesParams<ExampleModuleAttrs>): void => {
  // Text Options (text orientation / color classnames).
  classnamesInstance.add(textOptionsClassnames(attrs?.module?.advanced?.text));
};
