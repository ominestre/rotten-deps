/**
 * Rotten Deps NPM Interactions library
 * @module
 */

import * as proc from 'child_process';

export interface PackageDetails {
  time: Record<string, string>;
  name: string;
}

export interface OutdatedPackage {
  current: string;
  wanted: string;
  latest: string;
  location: string;
}

interface OutdatedData {
  [key: string]: OutdatedPackage;
}

interface OutdatedRequest {
  (): Promise<OutdatedData|Error>;
}

interface DetailsRequest {
  (): Promise<PackageDetails|Error>;
}


/**
 * Creates a function for running `npm outdated`
 */
export const createOutdatedRequest = (): OutdatedRequest => {
  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const args = ['outdated', '--json'];

  return () => new Promise(resolve => {
    /*  `npm outdated` errors with an exit code of 1 when you have outdated dependencies
        since one of the success scenarios involves an error this attempts to split
        actual errors from outdated dependencies */
    try {
      proc.execFileSync(command, args, { encoding: 'utf8' });
      // if the command is successful you have no outdated dependencies
      resolve({});
    } catch (error) {
      if (error.message !== 'Command failed: npm outdated --json') resolve(error);
      if (error.status !== 1) resolve(error);

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

  return (): Promise<PackageDetails | Error> => new Promise(resolve => {
    try {
      const response = proc.execFileSync(command, args, { encoding: 'utf8' });
      resolve(JSON.parse(response));
    } catch (e) {
      resolve(e);
    }
  });
};


export default {
  createOutdatedRequest,
  createDetailsRequest,
};
