<?php
//TODO change namespace
namespace IS\Template\Core;

use IS\Base\Core\Updater;
use IS\Base\Core\Auto_Instantiate;

class Plugin {
	private static Config $config;

	public static function boot(string $file): void {

		self::$config = Config::get_instance();

		if (file_exists(self::$config->path . 'languages/')) {
			load_plugin_textdomain(
				self::$config->pluginName,
				false,
				dirname(plugin_basename($file)) . '/languages/'
			);
		}

		//TODO change github repo link and plugin slug
		$updater = new Updater(
			'https://github.com/iService-dev/is-template-plugin',
			$file,
			'is-template-plugin'
		);
		$updater->init();
		
		//TODO only needed if classes in Admin or Frontend folder
		Auto_Instantiate::instantiate_classes_static(self::$config, 'Admin');
		Auto_Instantiate::instantiate_classes_static(self::$config, 'Frontend');
	}
}
