<?php
/**
 * ExampleModule::custom_css().
 *
 * @package D5_NS_PLACEHOLDER\Divi5\Modules\ExampleModule
 */

namespace D5_NS_PLACEHOLDER\Divi5\Modules\ExampleModule\ExampleModuleTrait;

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Direct access forbidden.' );
}

trait CustomCssTrait {

	/**
	 * Custom CSS fields.
	 *
	 * This is the FE equivalent of the JS const `cssFields` in
	 * src/components/example-module/custom-css.ts (minus the `label` property).
	 *
	 * @since ??
	 */
	public static function custom_css() {
		return \WP_Block_Type_Registry::get_instance()->get_registered( 'is/example-module' )->customCssFields;
	}
}
