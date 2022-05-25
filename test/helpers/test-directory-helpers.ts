import { join } from 'path';

const defaultDir = process.cwd();
const changeDir = (directory: string) => () => process.chdir(directory);

export const restoreDir = changeDir(defaultDir);
export const sampleAppDir = changeDir(
  join(__dirname, '../dummies/sample-app'),
);
export const noInstallDir = changeDir(
  join(__dirname, '../dummies/sample-app-no-install'),
);

export default {
  restoreDir,
  sampleAppDir,
  noInstallDir,
}
