<?php
//TODO change namespace
namespace IS\Template\Core;

use IS\Base\Core\Abstract_Config;

final class Config extends Abstract_Config {
	protected function __construct() {
		//TODO change pluginName and port if general plugin
		$this->pluginName = "is-template-plugin";
		$this->customPrefix = "iS_";
		$this->vitePort = 5500;

		parent::__construct();
	}
}




