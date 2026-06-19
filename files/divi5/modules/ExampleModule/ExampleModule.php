<?php
/**
 * Module: Example Module class.
 *
 * @package D5_NS_PLACEHOLDER\Divi5\Modules\ExampleModule
 */

namespace D5_NS_PLACEHOLDER\Divi5\Modules\ExampleModule;

if (!defined('ABSPATH')) {
	die('Direct access forbidden.');
}

use ET\Builder\Framework\DependencyManagement\Interfaces\DependencyInterface;
use ET\Builder\Packages\ModuleLibrary\ModuleRegistration;

/**
 * `ExampleModule` contains the functions used for the Example Module such as
 * Front-End rendering, classnames, styles and script data.
 *
 * It is a dependency class and can be used as a dependency for `DependencyTree`.
 *
 * @since ??
 */
class ExampleModule implements DependencyInterface {
	use ExampleModuleTrait\RenderCallbackTrait;
	use ExampleModuleTrait\ModuleClassnamesTrait;
	use ExampleModuleTrait\ModuleStylesTrait;
	use ExampleModuleTrait\ModuleScriptDataTrait;

	/**
	 * Loads `ExampleModule` and registers the Front-End render callback.
	 *
	 * @since ??
	 *
	 * @return void
	 */
	public function load() {
		// The folder name must match the component directory name copied to
		// modules-json/ by webpack (src/components/example-module → example-module).
		$module_json_folder_path = D5_CONST_PLACEHOLDER_JSON_PATH.'example-module/';

		add_action(
			'init',
			function () use ($module_json_folder_path) {
				ModuleRegistration::register_module(
					$module_json_folder_path,
					[
						'render_callback' => [ExampleModule::class, 'render_callback'],
					]
				);
			}
		);
	}
}
