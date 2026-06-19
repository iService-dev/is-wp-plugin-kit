<?php
/**
 * ExampleModule::module_classnames().
 *
 * @package D5_NS_PLACEHOLDER\Divi5\Modules\ExampleModule
 */

namespace D5_NS_PLACEHOLDER\Divi5\Modules\ExampleModule\ExampleModuleTrait;

if (!defined('ABSPATH')) {
	die('Direct access forbidden.');
}

use ET\Builder\Packages\Module\Options\Text\TextClassnames;

trait ModuleClassnamesTrait {

	/**
	 * Module classnames function for the Example Module.
	 *
	 * This is the FE equivalent of the JS function `moduleClassnames` in
	 * src/components/example-module/module-classnames.ts.
	 *
	 * @since ??
	 *
	 * @param array $args {
	 *     An array of arguments.
	 *
	 *     @type object $classnamesInstance Instance of ET\Builder\Packages\Module\Layout\Components\Classnames.
	 *     @type array  $attrs              Block attributes data being rendered.
	 * }
	 */
	public static function module_classnames($args) {
		$classnames_instance = $args['classnamesInstance'];
		$attrs               = $args['attrs'];

		$text_options_classnames = TextClassnames::text_options_classnames($attrs['module']['advanced']['text'] ?? []);

		if ($text_options_classnames) {
			$classnames_instance->add($text_options_classnames, true);
		}
	}
}
