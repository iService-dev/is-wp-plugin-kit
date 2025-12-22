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

const REQUIRED_WP_VERSION = '[wp-version-placeholder]';
const REQUIRED_PHP_VERSION = '[php-version-placeholder]';

// WordPress version check
global $wp_version;
if (version_compare($wp_version, REQUIRED_WP_VERSION, '<')) {
	add_action('admin_notices', function () {
		echo '<div class="notice notice-error"><p>';
		printf(
			esc_html__(
				'%1$s requires WordPress version %2$s or higher. Please update WordPress.',
				'[text-domain-placeholder]'
			),
			esc_html('[Plugin Name Placeholder]'),
			esc_html(REQUIRED_WP_VERSION)
		);
		echo '</p></div>';
	});
	add_action('admin_init', function () {
		deactivate_plugins(plugin_basename(__FILE__));
	});
	return;
}

// PHP version check
if (version_compare(PHP_VERSION, REQUIRED_PHP_VERSION, '<')) {
	add_action('admin_notices', function () {
		echo '<div class="notice notice-error"><p>';
		printf(
			esc_html__(
				'%1$s requires PHP version %2$s or higher. You are running PHP %3$s.',
				'[text-domain-placeholder]'
			),
			esc_html('[Plugin Name Placeholder]'),
			esc_html(REQUIRED_PHP_VERSION),
			esc_html(PHP_VERSION)
		);
		echo '</p></div>';
	});
	add_action('admin_init', function () {
		deactivate_plugins(plugin_basename(__FILE__));
	});
	return;
}
