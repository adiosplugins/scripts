<?php
error_reporting(0);
define('WP_DEBUG', false);

ob_start();

$root = require __DIR__ . DIRECTORY_SEPARATOR . 'localize-wordpress-root.php';

require $root . DIRECTORY_SEPARATOR . 'wp-load.php';

$url = plugin_dir_url(getcwd() . DIRECTORY_SEPARATOR . 'index.php');
$site = site_url();
$home = home_url();

ob_end_clean();

echo str_replace($site, $home, $url);
