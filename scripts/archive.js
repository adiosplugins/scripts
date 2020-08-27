const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const globby = require('globby');
const { getNodeArgsFromCLI } = require('@wordpress/scripts/utils');

let { scriptArgs } = getNodeArgsFromCLI();

function bytes4humans(size) {
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return `${(size / Math.pow(1024, i)).toFixed(2) * 1} ${['B', 'kB', 'MB', 'GB', 'TB'][i]}`;
}

function createArchive(filename = 'archive.zip', globs = []) {
  const output = fs.createWriteStream(filename);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => console.log(`FINISHED: ${bytes4humans(archive.pointer())}`));
  output.on('end', () => console.log('Data has been drained'));
  archive.on('warning', console.warn);
  archive.on('error', console.error);
  archive.pipe(output);

  const paths = globby.sync(globs, {
    dot: true,
  });

  paths.forEach(file => {
    archive.file(file);
  });

  archive.finalize();
}

const basePath = path.join(process.cwd(), '..');

const zipfile = scriptArgs.length > 0 ? scriptArgs[0] : path.basename(process.cwd()) + '.zip';

createArchive(path.join(basePath, zipfile), [
  '**',
  '!.git',
  '!.vscode',
  '!.idea',
  '!.env*',
  '!.php_cs*',
  '!.rsyncignore',
  '!node_modules',
]);
