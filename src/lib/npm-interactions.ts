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
    proc.execFile(command, args, { encoding: 'utf8' }, (err, stdout) => {
      if (err) {
        if (!err.message.includes('Command failed')) resolve(err);
        if (err.code !== 1) resolve(err);

        // hail mary attempt to parse the stdout in spite of the error
        try {
          resolve(JSON.parse(stdout));
        } catch {
          resolve(err);
        }
      }

      resolve(JSON.parse(stdout));
    });
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
    proc.execFile(command, args, { encoding: 'utf8' }, (err, stdout) => {
      if (err) resolve(err);
      resolve(JSON.parse(stdout));
    });
  });
};


export default {
  createOutdatedRequest,
  createDetailsRequest,
};
