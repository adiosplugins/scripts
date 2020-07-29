<?php
error_reporting(0);
define('WP_DEBUG', false);

ob_start();

$root = require __DIR__ . DIRECTORY_SEPARATOR . 'localize-wordpress-root.php';

require $root . DIRECTORY_SEPARATOR . 'wp-load.php';

ob_end_clean();

echo home_url();
