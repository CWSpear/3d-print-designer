const chokidar = require('chokidar');
const shell = require('shelljs');
const path = require('path');
const chalk = require('chalk');

const DIR_TO_WATCH = './designs'; // relative to project root (and run this command from root!)

shell.config.silent = true;

///

const absolutePath = path.join(process.cwd(), DIR_TO_WATCH);

// One-liner for current directory
chokidar.watch(absolutePath)
  .on('change', (filePath) => {
    const baseName = path.basename(filePath);
    const newName = baseName.replace(/\.js$/, '.stl');

    console.log(chalk.yellow(`[Compiling ${newName}...]\n`));

    shell.exec(
      `npx openjscad ${filePath} -o /Users/cwspear/Projects/Online3DViewer/build/website/scratch/${newName}`,
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

