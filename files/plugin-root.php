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

function plugin_slug_placeholder_bootstrap() {
	if (file_exists(__DIR__ . '/vendor/autoload.php')) {
		require __DIR__ . '/vendor/autoload.php';
	}
	
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

	$required_base_version = '[base-version-placeholder]';

	if (!\IS\Base\Core\Plugin_Requirements::check_base_version(
		$required_base_version,
		'[Plugin Name Placeholder]',
		__FILE__
	)) {
		return;
	}

	plugin_slug_placeholder_bootstrap();
}, 20);

