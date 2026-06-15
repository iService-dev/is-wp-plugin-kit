<?php
/**
 * Register all Divi 5 modules with the dependency tree.
 *
 * @package D5_NS_PLACEHOLDER\Divi5\Modules
 */

namespace D5_NS_PLACEHOLDER\Divi5\Modules;

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Direct access forbidden.' );
}

use D5_NS_PLACEHOLDER\Divi5\Modules\ExampleModule\ExampleModule;

add_action(
	'divi_module_library_modules_dependency_tree',
	function ( $dependency_tree ) {
		$dependency_tree->add_dependency( new ExampleModule() );
	}
);
