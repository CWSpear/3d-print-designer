const chokidar = require('chokidar');
const path = require('path');
const chalk = require('chalk');

// relative to this project directory
const WEB_ROOT = 'Online3DViewer/build/website';
const DIR_TO_WATCH = `${WEB_ROOT}/designs`;

///

const absoluteWatchPath = path.join(__dirname, DIR_TO_WATCH);
const absoluteWebRootPath = path.join(__dirname, WEB_ROOT);

console.log(absoluteWatchPath, absoluteWebRootPath);

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

// One-liner for current directory
chokidar.watch(absoluteWatchPath)
  .on('change', (filePath) => {
    const baseName = path.basename(filePath);

    console.log(chalk.blue(`[Detected change in ${baseName}...]\n`));
    console.log(chalk.yellow(`[Notifying...]`));

    io.emit('file-updated');

    console.log(chalk.green(`[Notified]`));
  })
  .on('ready', () => {
    console.log(chalk.cyan(`Watching ${DIR_TO_WATCH} for changes...\n`));
  });

