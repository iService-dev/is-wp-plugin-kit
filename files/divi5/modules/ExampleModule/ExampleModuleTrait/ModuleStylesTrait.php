<?php
/**
 * ExampleModule::module_styles().
 *
 * @package D5_NS_PLACEHOLDER\Divi5\Modules\ExampleModule
 */

namespace D5_NS_PLACEHOLDER\Divi5\Modules\ExampleModule\ExampleModuleTrait;

if (!defined('ABSPATH')) {
	die('Direct access forbidden.');
}

use ET\Builder\FrontEnd\Module\Style;
use ET\Builder\Packages\Module\Options\Css\CssStyle;
use D5_NS_PLACEHOLDER\Divi5\Modules\ExampleModule\ExampleModule;

trait ModuleStylesTrait {

	use CustomCssTrait;

	/**
	 * Example Module's style components.
	 *
	 * This is the FE equivalent of the JS function `ModuleStyles` in
	 * src/components/example-module/styles.tsx.
	 *
	 * @since ??
	 *
	 * @param array $args {
	 *     An array of arguments.
	 *
	 *      @type string         $id          Module ID. In VB it is a UUIDv4; on FE it is the order index.
	 *      @type string         $name        Module name.
	 *      @type array          $attrs       Module attributes.
	 *      @type string         $orderClass  Selector class name.
	 *      @type array          $settings    Custom settings.
	 *      @type string         $state       Attributes state.
	 *      @type string         $mode        Style mode.
	 *      @type ModuleElements $elements    ModuleElements instance.
	 * }
	 */
	public static function module_styles($args) {
		$attrs    = $args['attrs'] ?? [];
		$elements = $args['elements'];
		$settings = $args['settings'] ?? [];

		Style::add(
			[
				'id'            => $args['id'],
				'name'          => $args['name'],
				'orderIndex'    => $args['orderIndex'],
				'storeInstance' => $args['storeInstance'],
				'styles'        => [
					// Module.
					$elements->style(
						[
							'attrName'   => 'module',
							'styleProps' => [
								'disabledOn'     => [
									'disabledModuleVisibility' => $settings['disabledModuleVisibility'] ?? null,
								],
								'advancedStyles' => [
									[
										'componentName' => 'divi/text',
										'props'         => [
											'selector' => "{$args['orderClass']} .is_example_module__inner",
											'attr'     => $attrs['module']['advanced']['text'] ?? [],
										],
									],
								],
							],
						]
					),

					// Title.
					$elements->style(
						[
							'attrName' => 'title',
						]
					),

					// Content.
					$elements->style(
						[
							'attrName' => 'content',
						]
					),

					/*
					 * CssStyle must be added at the very bottom so the user's
					 * custom CSS can override the module styles above.
					 */
					CssStyle::style(
						[
							'selector'  => $args['orderClass'],
							'attr'      => $attrs['css'] ?? [],
							'cssFields' => ExampleModule::custom_css(),
						]
					),
				],
			]
		);
	}
}
