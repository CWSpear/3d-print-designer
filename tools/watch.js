const chokidar = require('chokidar');
const shell = require('shelljs');
const path = require('path');
const chalk = require('chalk');

// relative to project root (and run this command from root!)
const DIR_TO_WATCH = './cad/designs';
const OUTPUT_DIR = './Online3DViewer/build/website/designs';

shell.config.silent = true;

/// END CONFIG ///

const absoluteWatchPath = path.join(process.cwd(), DIR_TO_WATCH);
const absoluteOutputPath = path.join(process.cwd(), OUTPUT_DIR);

// One-liner for current directory
chokidar.watch(absoluteWatchPath)
  .on('change', (filePath) => {
    const baseName = path.basename(filePath);
    const newName = baseName.replace(/\.js$/, '.stl');

    console.log(chalk.yellow(`[Compiling ${newName}...]\n`));

    const outputFileName = path.join(absoluteOutputPath, newName);
    shell.exec(
      `npx openjscad ${filePath} -o ${outputFileName}`,
      (code, stdout, stderr) => {
        if (!!code || stderr) {
          console.error(chalk.red('[Error]\n\n', stderr));
        } else {
          // first line is output from openjscad
          console.log('' + stdout.split('\n').slice(1).join('\n'));

          console.log(chalk.green(`[Compiled ${newName}]`));
        }

        console.log(chalk.magenta('\n-------------\n'));
      }
    );
  })
  .on('ready', () => {
    console.log(chalk.cyan(`Watching ${DIR_TO_WATCH} for changes...\n`));
  });

