<?php
namespace NamespacePlaceholder\Core;

use IS\Base\Core\Abstract_Config;

final class Config extends Abstract_Config {
	protected function __construct() {
		$this->pluginName = "[plugin-slug-placeholder]";
		$this->customPrefix = "iS_";
		$this->vitePort = 5500;

		parent::__construct();
	}
}




