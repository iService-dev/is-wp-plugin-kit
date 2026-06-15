<?php
/**
 * ExampleModule::module_script_data()
 *
 * @package D5_NS_PLACEHOLDER\Divi5\Modules\ExampleModule
 */

namespace D5_NS_PLACEHOLDER\Divi5\Modules\ExampleModule\ExampleModuleTrait;

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Direct access forbidden.' );
}

use ET\Builder\Packages\Module\Layout\Components\MultiView\MultiViewScriptData;
use ET\Builder\Packages\Module\Options\Element\ElementScriptData;

trait ModuleScriptDataTrait {

	/**
	 * Set the script data for the module options used by the Example Module.
	 *
	 * This powers responsive/hover/sticky updates and inline-editor content sync.
	 *
	 * @since ??
	 *
	 * @param array $args {
	 *   Array of arguments.
	 *
	 *   @type string $id       Module id.
	 *   @type string $name     Module name.
	 *   @type string $selector Module selector.
	 *   @type array  $attrs    Module attributes.
	 * }
	 */
	public static function module_script_data( $args ) {
		$id             = $args['id'] ?? '';
		$name           = $args['name'] ?? '';
		$selector       = $args['selector'] ?? '';
		$attrs          = $args['attrs'] ?? [];
		$store_instance = $args['storeInstance'] ?? null;

		// Module decoration attributes.
		$module_decoration_attrs = $attrs['module']['decoration'] ?? [];

		// Element script data (decoration + link).
		ElementScriptData::set(
			[
				'id'            => $id,
				'selector'      => $selector,
				'attrs'         => array_merge(
					$module_decoration_attrs,
					[
						'link' => $attrs['module']['advanced']['link'] ?? [],
					]
				),
				'storeInstance' => $store_instance,
			]
		);

		// Keep the inline-edited title and content in sync across breakpoints.
		MultiViewScriptData::set(
			[
				'id'            => $id,
				'name'          => $name,
				'hoverSelector' => $selector,
				'setContent'    => [
					[
						'selector'      => $selector . ' .is_example_module__title',
						'data'          => $attrs['title']['innerContent'] ?? [],
						'valueResolver' => function ( $value ) {
							return $value ?? '';
						},
					],
					[
						'selector'      => $selector . ' .is_example_module__content',
						'data'          => $attrs['content']['innerContent'] ?? [],
						'valueResolver' => function ( $value ) {
							return $value ?? '';
						},
						'sanitizer'     => 'et_core_esc_previously',
					],
				],
			]
		);
	}
}
