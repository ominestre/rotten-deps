import * as util from 'util';
import * as fs from 'fs';


interface Rule {
  dependencyName: string;
  ignore: boolean;
  daysUntilExpiration: number;
}


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
 * Generates a configuration object by combinding user config
 * and default config. In cases of properties existing in both
 * configs the provided user config will take precedence.
 */
export const createConfig = (userConfig = {}): object => {
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
export const createFileReader = (absoluteFilePath: string) => {
  const readFilePromise = util.promisify(fs.readFile);
  return readFilePromise.bind(null, absoluteFilePath, { encoding: 'utf8' });
};

export default {
  createFileReader,
  createConfig,
  hasValidRules,
};
