import * as util from 'util';
import * as fs from 'fs';


interface Rule {
  readonly dependencyName: string;
  readonly ignore: boolean;
  readonly daysUntilExpiration: number;
}

export interface Config {
  readonly rules: Rule[];
}

interface FileReader {
  (): Promise<String>;
}


/**
 * Checks the validity of each rule in a configuration
 * @param rules list of rules to validate
 */
export const hasValidRules = (rules: Rule[]): boolean => {
  let valid = true;

  rules.forEach((rule: Rule) => {
    if (typeof rule.dependencyName !== 'string' || !rule.dependencyName.length) valid = false;
    if (typeof rule.ignore !== 'boolean') valid = false;
    if (typeof rule.daysUntilExpiration !== 'number') valid = false;
  });

  return valid;
};


/**
 * Generates a configuration object by combining user config
 * and default config. In cases of properties existing in both
 * configs the provided user config will take precendecn
 * @param userConfig
 */
export const createConfig = (userConfig = {}): Config => {
  const defaultConfig = {
    rules: [],
  };

  return {
    ...defaultConfig,
    ...userConfig,
  };
};


/**
 * Creates a filereader function for fetching the contents of a config
 * file at the provided path.
 * @param absoluteFilePath absolute path to the configuration file
 */
export const createFileReader = (absoluteFilePath: string): FileReader => {
  const readFilePromise = util.promisify(fs.readFile);
  return readFilePromise.bind(null, absoluteFilePath, { encoding: 'utf8' });
};


export default {
  createFileReader,
  createConfig,
  hasValidRules,
};
