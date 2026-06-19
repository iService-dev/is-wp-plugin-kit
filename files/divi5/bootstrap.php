<?php
/**
 * Divi 5 module bootstrap.
 *
 * Self-contained loader for the plugin's Divi 5 module(s). This file is required
 * by the main plugin only when Divi 5 is active. It:
 *   1. defines the path/url constants used by the modules,
 *   2. autoloads the module PHP classes (composer optional),
 *   3. registers the module(s) with the Divi 5 dependency tree, and
 *   4. enqueues the compiled Visual Builder + Front-End assets.
 *
 * @package D5_NS_PLACEHOLDER\Divi5
 */

if (!defined('ABSPATH')) {
	exit;
}

define('D5_CONST_PLACEHOLDER_PATH', plugin_dir_path(__FILE__));
define('D5_CONST_PLACEHOLDER_URL', plugin_dir_url(__FILE__));
define('D5_CONST_PLACEHOLDER_JSON_PATH', D5_CONST_PLACEHOLDER_PATH.'modules-json/');
define('D5_CONST_PLACEHOLDER_VERSION', \D5_NS_PLACEHOLDER\Core\Config::get_instance()->version);

/*
 * Autoload module classes. Composer is optional — if `composer dump-autoload`
 * has not been run, fall back to a tiny PSR-4 autoloader for our namespace.
 */
if (file_exists(D5_CONST_PLACEHOLDER_PATH.'vendor/autoload.php')) {
	require D5_CONST_PLACEHOLDER_PATH.'vendor/autoload.php';
} else {
	spl_autoload_register(
		function ($class) {
			$prefix = 'D5_NS_ESCAPED_PLACEHOLDER\\Divi5\\Modules\\';
			$len    = strlen($prefix);

			if (0 !== strncmp($prefix, $class, $len)) {
				return;
			}

			$relative = substr($class, $len);
			$file     = D5_CONST_PLACEHOLDER_PATH.'modules/'.str_replace('\\', '/', $relative).'.php';

			if (file_exists($file)) {
				require $file;
			}
		}
	);
}

// Register the module(s) with the Divi 5 module library dependency tree.
require D5_CONST_PLACEHOLDER_PATH.'modules/Modules.php';

/**
 * Enqueue the Visual Builder bundle (script + style).
 *
 * @since ??
 */
add_action(
	'divi_visual_builder_assets_before_enqueue_scripts',
	function () {
		if (!function_exists('et_builder_d5_enabled') || ! et_builder_d5_enabled()) {
			return;
		}

		if (!function_exists('et_core_is_fb_enabled') || ! et_core_is_fb_enabled()) {
			return;
		}

		\ET\Builder\VisualBuilder\Assets\PackageBuildManager::register_package_build(
			[
				'name'    => 'D5_HANDLE_PLACEHOLDER-builder-bundle-script',
				'version' => D5_CONST_PLACEHOLDER_VERSION,
				'script'  => [
					'src'                => D5_CONST_PLACEHOLDER_URL.'scripts/bundle.js',
					'deps'               => [
						'divi-module-library',
						'divi-vendor-wp-hooks',
					],
					'enqueue_top_window' => false,
					'enqueue_app_window' => true,
				],
			]
		);

		\ET\Builder\VisualBuilder\Assets\PackageBuildManager::register_package_build(
			[
				'name'    => 'D5_HANDLE_PLACEHOLDER-builder-vb-bundle-style',
				'version' => D5_CONST_PLACEHOLDER_VERSION,
				'style'   => [
					'src'                => D5_CONST_PLACEHOLDER_URL.'styles/vb-bundle.css',
					'deps'               => [],
					'enqueue_top_window' => false,
					'enqueue_app_window' => true,
				],
			]
		);
	}
);

/**
 * Enqueue the Front-End style bundle.
 *
 * @since ??
 */
add_action(
	'wp_enqueue_scripts',
	function () {
		if (file_exists(D5_CONST_PLACEHOLDER_PATH.'styles/bundle.css')) {
			wp_enqueue_style(
				'D5_HANDLE_PLACEHOLDER-bundle-style',
				D5_CONST_PLACEHOLDER_URL.'styles/bundle.css',
				[],
				D5_CONST_PLACEHOLDER_VERSION
			);
		}
	}
);
