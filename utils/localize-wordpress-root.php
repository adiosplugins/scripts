<?php
function localize_wordpress_root(string $dir = null) {
  if (!$dir) {
    $dir = getcwd();
  }

  $handle = opendir($dir);

  while (false !== ($entry = readdir($handle))) {
    if ($entry === 'wp-load.php') {
      return $dir;
    }
  }

  if (!empty($dir)) {
    $dir_parts = explode(DIRECTORY_SEPARATOR, $dir);
    array_pop($dir_parts);

    return localize_wordpress_root(implode(DIRECTORY_SEPARATOR, $dir_parts));
  }

  return null;
}

return localize_wordpress_root();
