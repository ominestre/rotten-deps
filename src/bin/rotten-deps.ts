#!/usr/bin/env node

import * as yargs from 'yargs';
import {
  isAbsolute,
  resolve as pathResolve,
} from 'path';
import * as Table from 'cli-table';
import { existsSync } from 'fs';
import { configuration, generateReport } from '../lib/index';

import type { ReportData } from '../lib/index';
import type { Config } from '../lib/config';

const { argv } = yargs
  .scriptName('rotten-deps')
  .usage('$0 [options]')
  .option('config-path', {
    demand: true,
    description: 'path to rotten-deps configuration file',
    type: 'string',
  });

if (argv.help) yargs.showHelp();

const maestro = (configPath: string): void => {
  const configReader = configuration.createFileReader(configPath);

  const processConfigData = (x: string): Promise<object> => new Promise(resolve => {
    resolve(JSON.parse(x));
  });

  const buildConfigObject = (x: Config): Promise<object> => new Promise(resolve => {
    resolve(configuration.createConfig(x));
  });

  const processReport = (x: ReportData[]|Error): Promise<string|ReportData[]> => new Promise(resolve => {
    if (x instanceof Error) throw x;
    if (argv.json) resolve(x);

    const table = new Table({
      head: ['name', 'current version', 'latest version', 'days outdated', 'is outdated'],
    });

    x.forEach(({
      name,
      current,
      latest,
      daysOutdated,
      isOutdated,
      isIgnored,
    }) => {
      const outdated = isIgnored ? 'ignored' : isOutdated;
      table.push([name, current, latest, daysOutdated, outdated]);
    });

    resolve(table.toString());
  });

  configReader()
    .then(processConfigData)
    .then(buildConfigObject)
    .then(generateReport)
    .then(processReport)
    .then(console.log);
};

const configPath = argv['config-path'];

if (isAbsolute(configPath)) {
  maestro(configPath);
} else {
  const maybePath = pathResolve(configPath);
  if (!existsSync(maybePath)) yargs.exit(1, new Error(`${configPath} could not be resolved from configuration`));
  maestro(maybePath);
}
