import * as util from 'util';
import * as fs from 'fs';


interface Rule {
  dependencyName: string;
  ignore: boolean;
  daysUntilExpiration: number;
}


interface Config {
  rules: Rule[];
}


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
};
