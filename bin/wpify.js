#!/usr/bin/env node

require('dotenv').config();

const path = require('path');
const spawn = require('cross-spawn');

const { getNodeArgsFromCLI, spawnScript: wordPressSpawnScript } = require('@wordpress/scripts/utils');

let { scriptName, scriptArgs, nodeArgs } = getNodeArgsFromCLI();

const handleSignal = (signal) => {
  if (signal === 'SIGKILL') {
    // eslint-disable-next-line no-console
    console.log(
      'The script failed because the process exited too early. ' +
      'This probably means the system ran out of memory or someone called ' +
      '`kill -9` on the process.'
    );
  } else if (signal === 'SIGTERM') {
    // eslint-disable-next-line no-console
    console.log(
      'The script failed because the process exited too early. ' +
      'Someone might have called `kill` or `killall`, or the system could ' +
      'be shutting down.'
    );
  }

  process.exit(1);
};

const spawnScript = (scriptName, args = [], nodeArgs = []) => {
  const { signal, status } = spawn.sync(
    'node',
    [ ...nodeArgs, path.resolve(__dirname, '../scripts', scriptName), ...args ],
    {
      stdio: 'inherit',
    }
  );

  if (signal) {
    handleSignal(signal);
  }

  process.exit(status);
};

if (!scriptName) {
  scriptName = scriptArgs.splice(0, 1).find(Boolean);
}

if (['build', 'start', 'hot'].includes(scriptName)) {
  spawnScript(scriptName, scriptArgs, nodeArgs);
} else {
  wordPressSpawnScript(scriptName, scriptArgs, nodeArgs);
}
