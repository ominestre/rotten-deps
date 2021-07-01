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

  /*  NPM 7.x included a breaking change to the exit codes for the `outdated` command.
    Prior to v7 the command would exit 1 if you had any outdated dependencies.
    After v7 it exits 0 */
  return () => new Promise(resolve => {
    try {
      const results = proc.execFileSync(command, args, { encoding: 'utf8' });
      resolve(JSON.parse(results));
    } catch (error) {
      if (error.message !== 'Command failed: npm outdated --json') resolve(error);
      if (error.status !== 1) resolve(error);

      try {
        resolve(JSON.parse(error.stdout));
      } catch {
        resolve(error);
      }
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
