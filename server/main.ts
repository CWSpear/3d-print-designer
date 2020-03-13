import chalk from 'chalk';
import * as chokidar from 'chokidar';
import * as fs from 'fs-extra';
import notifier from 'node-notifier';
import Bundler from 'parcel-bundler';

import * as path from 'path';
import * as shell from 'shelljs';
import { exec } from './util/shelljs-better';

import express from 'express';
import socketio from 'socket.io';
import { createServer } from 'http';

/////// CONFIG ////////

const PORT = 3333;

// relative to project root (and run this command from root!)
// const WEB_ROOT_DIST = './site/dist';
// const WEB_ROOT_SRC = './site/src';
// const DESIGN_DIR = `./cad/designs`;
// const DESIGN_BUILD_DIR = `./cad/build`;

const WEB_ROOT_DIST = './Online3DViewer/build/website';
const WEB_ROOT_SRC = './Online3DViewer/build/website';
const DESIGN_DIR = `./cad/designs`;
const DESIGN_BUILD_DIR = `./cad/build`;

const BUILD_URL = 'build';

shell.config.silent = true;

///// END CONFIG //////

const absoluteWebRootDirPath = path.join(process.cwd(), WEB_ROOT_DIST);
const absoluteWebRootSrcPath = path.join(process.cwd(), WEB_ROOT_SRC);
const absoluteDesignDirPath = path.join(process.cwd(), DESIGN_DIR);
const absoluteDesignBuildDirPath = path.join(process.cwd(), DESIGN_BUILD_DIR);

/// SERVER SET UP ///

const app = express();
const http = createServer(app);
const io = socketio(http);

app.use(express.static(absoluteWebRootDirPath, { fallthrough: true }));

app.get(`/${BUILD_URL}/*`, (req, res) => {
  res.sendFile(path.join(absoluteDesignBuildDirPath, req.url.replace(new RegExp(`\/${BUILD_URL}`), '')));
});

http.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});

io.on('connection', () => {
  io.emit('ready');
});

const workingOnNewSite = false;

/// INIT CODE ///

(async () => {
  // TODO this doesn't get files in folders yet
  const files = await fs.readdir(absoluteDesignBuildDirPath);

  const filteredFiles = files.filter(file => file.match(/\.stl$/));

  console.log(chalk.cyan(`Watching ${DESIGN_DIR} for changes...\n`));

  console.log(chalk.yellow('Existing compiled designs:\n'));

  filteredFiles.forEach((file) => {
    console.log(chalk.blue(`http://localhost:${PORT}#${BUILD_URL}/${file}`));
  });

  console.log('\n');

  console.log(chalk.magenta(`\n-----------\n`));

  chokidar.watch(absoluteDesignDirPath)
    .on('change', processDesignFileChange)
    .on('ready', () => {
      console.log(chalk.cyan(`Watching ${absoluteDesignDirPath.replace(process.cwd(), '.')} for changes...\n`));
    });

  if (workingOnNewSite) {
    chokidar.watch(absoluteWebRootSrcPath)
      .on('all', (event: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir', path: string) => {
        if (event !== 'add' || 'change') {
          return;
        }

        buildSite();
      })
      .on('ready', () => {
        console.log(chalk.cyan(`Watching ${absoluteWebRootSrcPath.replace(process.cwd(), '.')} for changes...\n`));
      });

    await buildSite();
  }
})().catch(err => {
  console.error(chalk.red('Error on startup'), err);
});

/// HANDLERS ///

async function processDesignFileChange(filePath: string) {
  const baseName = path.basename(filePath);
  const dirName = path.dirname(filePath);
  const relativeOutDir = dirName.replace(absoluteDesignDirPath, '');
  const outputDir = path.join(absoluteDesignBuildDirPath, relativeOutDir);
  const newName = baseName.replace(/\.js$/, '.stl');
  const outputFileName = path.join(outputDir, newName);

  await fs.mkdirp(outputDir);

  console.log({
    filePath,
    baseName,
    relativeOutDir,
    outputDir,
    newName,
    outputFileName,
  });

  console.log(chalk.yellow(`Compiling ${newName}...\n`));

  try {
    const output = await exec(`npx openjscad ${filePath} -o ${outputFileName}`);
    // first line is output from openjscad
    console.log(output.split('\n').slice(1).join('\n'));
  } catch (err) {
    console.error(chalk.red('[Error]\n\n', err));
    return;
  }

  const pathToIt = path.join(BUILD_URL, relativeOutDir, newName);
  const url = `http://localhost:${PORT}#${pathToIt}`;
  console.log(chalk.green(`Compiled ${pathToIt}`));

  console.log(chalk.yellow(`\nNotifying...`));

  io.emit('file-updated');

  notifier.notify(
    {
      title: '3D Print Design',
      message: `${newName} has finished compiling.`,
      timeout: 4,
      open: url,
      actions: ['Close'],
    },
  );

  console.log(chalk.green(`Notified`));
  console.log(chalk.blue(`\nView file at: ${url}`));

  console.log(chalk.magenta(`\n-----------\n`));
}

async function buildSite() {
  // Initializes a bundler using the entrypoint location and options provided
  const bundler = new Bundler(`${absoluteWebRootSrcPath}/index.html`, {
    outDir: './site/dist',
  });

  // Run the bundler, this returns the main bundle
  // Use the events if you're using watch mode as this promise will only trigger once and not for every rebuild
  await bundler.bundle();

  console.log(chalk.magenta(`\n-----------\n`));
}
