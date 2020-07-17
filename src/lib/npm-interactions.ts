import * as proc from 'child_process';

interface PackageDetails {
  time?: object;
}

interface OutdatedRequest {
  (): Promise<object | Error>;
}

interface DetailsRequest {
  (): Promise<PackageDetails>;
}


/**
 * Creates a function for running `npm outdated`
 */
export const createOutdatedRequest = (): OutdatedRequest => {
  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const args = ['outdated', '--json'];

  return () => new Promise((resolve, reject) => {
    /*  `npm outdated` errors with an exit code of 1 when you have outdated dependencies
        since one of the success scenarios involves an error this attempts to split
        actual errors from outdated dependencies */
    try {
      proc.execFileSync(command, args, { encoding: 'utf8' });
      // if the command is successful you have no outdated dependencies
      resolve({});
    } catch (error) {
      if (error.message !== 'Command failed: npm outdated --json') reject(error);
      if (error.status !== 1) reject(error);

      resolve(JSON.parse(error.stdout));
    }
  });
};


/**
 * Creates a function to run the `npm view` command for a specific dependency
 * @param dependencyName
 */
export const createDetailsRequest = (dependencyName: string): DetailsRequest => {
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
