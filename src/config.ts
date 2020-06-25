import * as util from 'util';
import * as fs from 'fs';

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
};
