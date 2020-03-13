import * as shell from 'shelljs';

export function exec(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    shell.exec(cmd, (code, stdout, stderr) => {
      if (!!code || stderr) {
        return reject(new Error(stderr));
      }

      resolve(stdout);
    });
  });
}
