const { startWatcher } = require('../tools/watch');

const path = require('path');
const chalk = require('chalk');
const notifier = require('node-notifier');

// relative to this project directory
const WEB_ROOT = '../Online3DViewer/build/website';
const DIR_TO_WATCH = `${WEB_ROOT}/designs`;

///

const absoluteWatchPath = path.join(__dirname, DIR_TO_WATCH);
const absoluteWebRootPath = path.join(__dirname, WEB_ROOT);

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

http.listen(3333, () => {
  console.log('Listening on port 3333');
});

io.on('connection', () => {
  io.emit('ready');
});

app.use(express.static(absoluteWebRootPath));

startWatcher()
  .on('ready', ({ files, watchDir }) => {
    console.log(chalk.cyan(`Watching ${watchDir} for changes...\n`));

    console.log(chalk.yellow('Existing compiled designs:\n'));

    files.forEach((file) => {
      console.log(chalk.blue(`http://localhost:3333#designs/${file}`));
    });

    console.log('\n');
  })
  .on('start-compile', ({ newName }) => {
    console.log(chalk.yellow(`Compiling ${newName}...\n`));
  })
  .on('end-compile', ({ newName, output }) => {
    console.log(output);

    const url = `http://localhost:3333#designs/${newName}`;
    console.log(chalk.green(`Compiled ${newName}`));

    console.log(chalk.yellow(`\nNotifying...`));

    io.emit('file-updated');

    notifier.notify(
      {
        title: '3D Print Design',
        message: `${newName} has finished compiling.`,
        timeout: 4,
        open: url,
        actions: ['Close']
      }
    );

    console.log(chalk.green(`Notified`));
    console.log(chalk.blue(`\nView file at: ${url}`));
  })
  .on('finally', () => {
    console.log(chalk.magenta(`\n-----------\n`));
  })
  .on('error', ({ err }) => {
    console.error(chalk.red('[Error]\n\n', err));
  });
