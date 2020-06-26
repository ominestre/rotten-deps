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
      // since an error can be a success the proceeding attempt to bubble up actual failures
      if (error.message !== 'Command failed: npm outdated --json') reject(error);
      if (error.status !== 1) reject(error);

      resolve(JSON.parse(error.stdout));
    }
  });
};


export const createDetailsRequest = (dependencyName: string): Function => {
  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const args = ['view', '--json', dependencyName];

  return (): Promise<object> => new Promise(resolve => {
    const response = proc.execFileSync(command, args, { encoding: 'utf8' });
    resolve(JSON.parse(response));
  });
};


export default {
  createOutdatedRequest,
  createDetailsRequest,
};
