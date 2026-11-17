<?php
/**
 * Front-End files of one module.
 *
 * @package D5_NS_PLACEHOLDER\Divi5\Modules
 */

namespace D5_NS_PLACEHOLDER\Divi5\Modules;

if (!defined('ABSPATH')) {
	die('Direct access forbidden.');
}

class Assets {

	/**
	 * Loads styles/<module>.css and scripts/<module>.js (built from
	 * src/components/<module>/module.scss and module.ts) if they exist. Called from
	 * the module's render callback, so they only load on pages that use the module.
	 * WordPress 6.9+ moves styles enqueued during rendering into <head> on classic
	 * themes like Divi, so there is no flash of unstyled content.
	 *
	 * @param string $module Folder name in src/components/, e.g. 'example-module'.
	 */
	public static function enqueue(string $module): void {
		$handle = 'D5_HANDLE_PLACEHOLDER-'.$module;

		if (file_exists(D5_CONST_PLACEHOLDER_PATH."styles/{$module}.css")) {
			wp_enqueue_style($handle, D5_CONST_PLACEHOLDER_URL."styles/{$module}.css", [], D5_CONST_PLACEHOLDER_VERSION);
		}

		if (file_exists(D5_CONST_PLACEHOLDER_PATH."scripts/{$module}.js")) {
			wp_enqueue_script($handle, D5_CONST_PLACEHOLDER_URL."scripts/{$module}.js", [], D5_CONST_PLACEHOLDER_VERSION, true);
		}
	}
}
