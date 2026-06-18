<?php
/**
 * ExampleModule::render_callback()
 *
 * @package D5_NS_PLACEHOLDER\Divi5\Modules\ExampleModule
 */

namespace D5_NS_PLACEHOLDER\Divi5\Modules\ExampleModule\ExampleModuleTrait;

if ( ! defined( 'ABSPATH' ) ) {
	die( 'Direct access forbidden.' );
}

// phpcs:disable ET.Sniffs.ValidVariableName.UsedPropertyNotSnakeCase -- WP uses camelCase in \WP_Block_Parser_Block.

use ET\Builder\Packages\Module\Module;
use ET\Builder\Framework\Utility\HTMLUtility;
use ET\Builder\FrontEnd\BlockParser\BlockParserStore;
use ET\Builder\Packages\Module\Options\Element\ElementComponents;
use D5_NS_PLACEHOLDER\Divi5\Modules\ExampleModule\ExampleModule;

trait RenderCallbackTrait {

	/**
	 * Example Module render callback which outputs the server-side rendered HTML on the Front-End.
	 *
	 * This is the FE equivalent of the JS edit component in
	 * src/components/example-module/edit.tsx.
	 *
	 * @since ??
	 *
	 * @param array          $attrs    Block attributes that were saved by VB.
	 * @param string         $content  Block content.
	 * @param WP_Block       $block    Parsed block object being rendered.
	 * @param ModuleElements $elements ModuleElements instance.
	 *
	 * @return string The module's rendered HTML.
	 */
	public static function render_callback( $attrs, $content, $block, $elements ) {
		// Front-End script for this module (compiled to scripts/module.js).
		wp_enqueue_script( 'D5_HANDLE_PLACEHOLDER-frontend', D5_CONST_PLACEHOLDER_URL . 'scripts/module.js', [], D5_CONST_PLACEHOLDER_VERSION, true );

		// Title.
		$title = $elements->render(
			[
				'attrName' => 'title',
			]
		);

		// Content, wrapped in its styling container.
		$content_html = HTMLUtility::render(
			[
				'tag'               => 'div',
				'attributes'        => [
					'class' => 'is_example_module__content',
				],
				'childrenSanitizer' => 'et_core_esc_previously',
				'children'          => $elements->render(
					[
						'attrName' => 'content',
					]
				),
			]
		);

		$parent       = BlockParserStore::get_parent( $block->parsed_block['id'], $block->parsed_block['storeInstance'] );
		$parent_attrs = $parent->attrs ?? [];

		return Module::render(
			[
				// FE only.
				'orderIndex'          => $block->parsed_block['orderIndex'],
				'storeInstance'       => $block->parsed_block['storeInstance'],

				// VB equivalent.
				'attrs'               => $attrs,
				'elements'            => $elements,
				'id'                  => $block->parsed_block['id'],
				'name'                => $block->block_type->name,
				'moduleCategory'      => $block->block_type->category,
				'classnamesFunction'  => [ ExampleModule::class, 'module_classnames' ],
				'stylesComponent'     => [ ExampleModule::class, 'module_styles' ],
				'scriptDataComponent' => [ ExampleModule::class, 'module_script_data' ],
				'parentAttrs'         => $parent_attrs,
				'parentId'            => $parent->id ?? '',
				'parentName'          => $parent->blockName ?? '',
				'children'            => [
					ElementComponents::component(
						[
							'attrs'         => $attrs['module']['decoration'] ?? [],
							'id'            => $block->parsed_block['id'],

							// FE only.
							'orderIndex'    => $block->parsed_block['orderIndex'],
							'storeInstance' => $block->parsed_block['storeInstance'],
						]
					),
					HTMLUtility::render(
						[
							'tag'               => 'div',
							'attributes'        => [
								'class' => 'is_example_module__inner',
							],
							'childrenSanitizer' => 'et_core_esc_previously',
							'children'          => $title . $content_html,
						]
					),
				],
			]
		);
	}
}
