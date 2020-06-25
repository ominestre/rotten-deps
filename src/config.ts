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


/*  TODO this will eventually overlay a default config with the provided
      user config. For now it just reflects the input config */
export const createConfig = (userConfig: object): Config => userConfig;


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
