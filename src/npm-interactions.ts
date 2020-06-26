import * as proc from 'child_process';
import * as util from 'util';


export const createOutdatedRequest = (): Function => {
  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const args = ['outdated', '--json'];

  return (): Promise<object> => new Promise((resolve, reject) => {
    // `npm outdated` errors with an exit code of 1 when you have outdated dependencies
    try {
      proc.execFileSync(command, args, { encoding: 'utf8' });
      /*  if `execFileSync` successfully runs there are no outdated dependencies
          in that case we resolve an empty object */
      resolve({});
    } catch (error) {
      if (error.message !== 'Command failed: npm outdated --json') reject(error);
      if (error.status !== 1) reject(error);
      resolve(JSON.parse(error.stdout));
    }
  });
};


export const createDetailsRequest = (dependencyName: string): Function => {
  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const args = ['view', '--json', dependencyName];

  const commandPromise = util.promisify(proc.execFile);
  return commandPromise.bind(null, command, args);
};


export default {
  createOutdatedRequest,
  createDetailsRequest,
};
