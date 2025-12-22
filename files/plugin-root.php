<?php
/**
 * Plugin Name: [Plugin Name Placeholder]
 * Description: [Plugin Description Placeholder]
 * Version: 0.0.1
 * Author: iService
 * Requires at least: [wp-version-placeholder]
 * Requires PHP: [php-version-placeholder]
 * Author URI: https://iservice.at
 * Text Domain: [text-domain-placeholder]
 * Domain Path: /languages
 * Update URI: false
 */

if (!defined('ABSPATH'))
	exit;

define('PLUGIN_TYPE', 'general');

const REQUIRED_BASE_VERSION = '[base-version-placeholder]';
// Note: These values should match the plugin header above
const REQUIRED_WP_VERSION = '[wp-version-placeholder]';
const REQUIRED_PHP_VERSION = '[php-version-placeholder]';


function plugin_slug_placeholder_bootstrap() {
	if (file_exists(__DIR__ . '/vendor/autoload.php')) {
		require __DIR__ . '/vendor/autoload.php';
	}
	require_once plugin_dir_path(__FILE__) . 'includes/autoloader.php';
	new \IS\Autoloader(
		'[NamespacePlaceholder]',
		plugin_dir_path(__FILE__) . 'includes/lib'
	);

	\NamespacePlaceholder\Core\Plugin::boot(__FILE__);
}

add_action('plugins_loaded', function () {

	if (!did_action('is/base/loaded')) {
		add_action('admin_notices', function () {
			echo '<div class="notice notice-error"><p>';
			printf(
				esc_html__(
					'%s requires IS Base Plugin to be installed and activated.',
					'[text-domain-placeholder]'
				),
				esc_html('[Plugin Name Placeholder]')
			);
			echo '</p></div>';
		});
		add_action('admin_init', function () {
			deactivate_plugins(plugin_basename(__FILE__));
		});
		return;
	}

	if (!\IS\Base\Core\Plugin_Requirements::check_base_version(
		REQUIRED_BASE_VERSION,
		'[Plugin Name Placeholder]',
		__FILE__
	)) {
		return;
	}

	if(!IS\Base\Core\Plugin_Requirements::check(
		'[Plugin Name Placeholder]',
		REQUIRED_WP_VERSION,
		REQUIRED_PHP_VERSION,
		__FILE__
	)) {
		return;
	}

	plugin_slug_placeholder_bootstrap();
}, 20);

