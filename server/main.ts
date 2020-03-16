import chalk from 'chalk';
import * as chokidar from 'chokidar';

import express from 'express';
import * as fs from 'fs-extra';
import { createServer } from 'http';
import notifier from 'node-notifier';
import Bundler from 'parcel-bundler';

import * as path from 'path';
import * as shell from 'shelljs';
import socketio from 'socket.io';
import { Shape } from '../cad/designer/shape';
import { exec } from './util/shelljs-better';
import { forEach } from 'lodash';

const stlSerializer = require('@jscad/stl-serializer');

/////// CONFIG ////////

const WORKING_ON_NEW_SITE = true;

const PORT = 3333;

// relative to project root (and run this command from root!)
let WEB_ROOT_DIST = './site/dist';
let WEB_ROOT_SRC = './site/src';
let DESIGN_DIR = `./cad/designs`;
let DESIGN_BUILD_DIR = `./cad/build`;

if (!WORKING_ON_NEW_SITE) {
  WEB_ROOT_DIST = './Online3DViewer/build/website';
  WEB_ROOT_SRC = './Online3DViewer/website';
  DESIGN_DIR = `./cad/designs`;
  DESIGN_BUILD_DIR = `./cad/build`;
}

const BUILD_URL = 'build';

shell.config.silent = true;

///// END CONFIG //////

const absoluteWebRootDirPath = path.join(process.cwd(), WEB_ROOT_DIST);
const absoluteWebRootSrcPath = path.join(process.cwd(), WEB_ROOT_SRC);
const absoluteDesignDirPath = path.join(process.cwd(), DESIGN_DIR);
const absoluteDesignBuildDirPath = path.join(process.cwd(), DESIGN_BUILD_DIR);

/// SERVER SET UP ///

console.log(chalk.magenta(`\n-----------\n`));

const app = express();
const http = createServer(app);
const io = socketio(http);

app.use(express.static(absoluteWebRootDirPath, { fallthrough: true }));

app.get(`/${BUILD_URL}/*`, (req, res) => {
  res.sendFile(path.join(absoluteDesignBuildDirPath, req.url.replace(new RegExp(`\/${BUILD_URL}`), '')));
});

http.listen(PORT, () => {
  console.log(chalk.cyan(`Listening at http://localhost:${PORT}`));

  console.log(chalk.magenta(`\n-----------\n`));

  ready().catch(err => {
    console.error(chalk.red('Error on startup'), err);
  });
});

io.on('connection', socket => {
  socket.on('join-room', id => {
    socket.join(id);

    socket.on('client-triggered-reload', async () => {
      let filePath = path.join(absoluteDesignDirPath, id.replace(BUILD_URL, '').replace(/\.[^.]*?$/, ''));

      if (await fs.pathExists(`${filePath}.ts`)) {
        filePath += '.ts';
      } else {
        filePath += '.js';
      }

      await processDesignFileChange(filePath);
    });
  });
});

io.on('client-triggered-reload', async (url: string) => {
  console.log('banana');
  // await processDesignFileChange(path.join(absoluteDesignBuildDirPath, '..', url));
});

/// INIT CODE ///

// Initializes a bundler using the entrypoint location and options provided
const bundler = new Bundler(`${absoluteWebRootSrcPath}/index.html`, {
  outDir: './site/dist',
  sourceMaps: true,
});

async function ready() {
  console.log(chalk.yellow('Existing compiled designs:\n'));

  await printExistingBuilds();

  console.log(chalk.magenta(`\n-----------\n`));

  chokidar
    .watch(absoluteDesignDirPath)
    .on('change', processDesignFileChange)
    .on('ready', () => {
      console.log(chalk.cyan(`Watching ${absoluteDesignDirPath.replace(process.cwd(), '.')} for changes...\n`));
    });

  if (WORKING_ON_NEW_SITE) {
    chokidar
      .watch(absoluteWebRootSrcPath)
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
}

/// HANDLERS ///

async function processDesignFileChange(filePath: string) {
  const baseName = path.basename(filePath);
  const dirName = path.dirname(filePath);
  const relativeOutDir = dirName.replace(absoluteDesignDirPath, '');
  const outputDir = path.join(absoluteDesignBuildDirPath, relativeOutDir);
  const newName = baseName.replace(/\.[jt]s$/, '.stl');
  const outputFileName = path.join(outputDir, newName);

  const pathToIt = path.join(BUILD_URL, relativeOutDir, newName);

  io.to(pathToIt).emit('file-update-start');

  await fs.mkdirp(outputDir);

  console.log(chalk.yellow(`Compiling ${newName}...\n`));

  try {
    if (filePath.match(/\.ts$/)) {
      console.log();
      forEach(require.cache, (r, p) => {
        if (p.match(/cad\/(designs|designer)/)) {
          delete require.cache[p];
        }
      });

      const { default: shape }: { default: Shape } = require(filePath);

      const output: string[] | ArrayBuffer[] = stlSerializer.serialize(shape.render(), { binary: false });
      await fs.writeFile(outputFileName, output, typeof output[0] === 'string' ? 'utf-8' : 'binary');
    } else {
      delete require.cache[require.resolve(filePath)];
      const render = require(filePath);

      if (typeof render === 'function') {
        const output: string[] | ArrayBuffer[] = stlSerializer.serialize(render(), { binary: false });
        await fs.writeFile(outputFileName, output, typeof output[0] === 'string' ? 'utf-8' : 'binary');
      } else {
        const output = await exec(`npx openjscad ${filePath} -of stla -o ${outputFileName}`);
        // first line is output from openjscad
        console.log(
          output
            .split('\n')
            .slice(1)
            .join('\n'),
        );
      }
    }
  } catch (err) {
    console.error(chalk.red('[Error]\n\n', err, err.stack));

    notifier.notify({
      title: '3D Print Design',
      message: `${newName} had an error.`,
      timeout: 4,
      actions: ['Close'],
      sound: 'Basso',
    });

    return;
  }

  const url = `http://localhost:${PORT}#${pathToIt}`;
  console.log(chalk.green(`Compiled ${pathToIt}`));

  console.log(chalk.yellow(`\nNotifying...`));

  io.to(pathToIt).emit('file-update-end');

  notifier.notify({
    title: '3D Print Design',
    message: `${newName} has finished compiling.`,
    timeout: 4,
    open: url,
    actions: ['Close'],
  });

  console.log(chalk.green(`Notified`));
  console.log(chalk.blue(`\nView file at: ${url}`));

  console.log(chalk.magenta(`\n-----------\n`));
}

async function buildSite() {
  // Run the bundler, this returns the main bundle
  // Use the events if you're using watch mode as this promise will only trigger once and not for every rebuild
  await bundler.bundle();

  console.log(chalk.magenta(`\n-----------\n`));
}

async function printExistingBuilds(dirPath: string = absoluteDesignBuildDirPath) {
  const files = await fs.readdir(dirPath);

  await Promise.all(
    files.map(async file => {
      if (file[0] === '.') {
        return;
      }

      const absolutePath = path.join(dirPath, file);

      const stats = await fs.stat(absolutePath);

      if (stats.isDirectory()) {
        await printExistingBuilds(absolutePath);
      }
    }),
  );

  const filteredFiles = files.filter(file => file.match(/\.stl$/));

  filteredFiles.forEach(file => {
    const p = path.join(dirPath, file).replace(absoluteDesignBuildDirPath, '');
    console.log(chalk.blue(`http://localhost:${PORT}#${BUILD_URL}${p}`));
  });
}
