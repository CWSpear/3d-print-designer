const chokidar = require('chokidar');
const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const EventEmitter = require('events');

// relative to project root (and run this command from root!)
const DIR_TO_WATCH = './cad/designs';
const OUTPUT_DIR = './Online3DViewer/build/website/designs';

shell.config.silent = true;

/// END CONFIG ///

const absoluteWatchPath = path.join(process.cwd(), DIR_TO_WATCH);
const absoluteOutputPath = path.join(process.cwd(), OUTPUT_DIR);

module.exports.startWatcher = function startWatcher() {
  const events = new EventEmitter();

  fs.readdir(absoluteOutputPath, (err, files) => {
    const filteredFiles = files.filter(file => file.match(/\.stl$/));
    events.emit('ready', { files: filteredFiles, watchDir: DIR_TO_WATCH });
    events.emit('finally');
  });

  // One-liner for current directory
  chokidar.watch(absoluteWatchPath)
    .on('change', onFileChange)
    .on('ready', () => {
      console.log(chalk.cyan(`Watching ${DIR_TO_WATCH} for changes...\n`));
    });

  // helps with debug
  onFileChange('/Users/cwspear/Projects/3d-designer/cad/designs/spirit-island/spirit-island-token-holder.js');

  return events;

  function onFileChange(filePath) {
    const baseName = path.basename(filePath);
    const newName = baseName.replace(/\.js$/, '.stl');

    const outputFileName = path.join(absoluteOutputPath, newName);

    events.emit('start-compile', { newName });

    shell.exec(
      `npx openjscad ${filePath} -o ${outputFileName}`,
      (code, stdout, stderr) => {
        if (!!code || stderr) {
          events.emit('error', { err: stderr });
        } else {
          // first line is output from openjscad
          const output = stdout.split('\n').slice(1).join('\n');

          events.emit('end-compile', { newName, output });
        }

        events.emit('finally');
      }
    );
  }
};
