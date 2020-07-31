#!/usr/bin/env node

import * as yargs from 'yargs';
import {
  isAbsolute,
  resolve as pathResolve,
  resolve,
} from 'path';
import * as Table from 'cli-table';
import { existsSync } from 'fs';
import { configuration, generateReport } from '../lib/index';

import type { ReportData } from '../lib/index';
import type { Config } from '../lib/config';

interface ProcessedReport {
  table: string;
  json: string;
  status: ExitCode;
}

// 0 - no outdated deps
// 1 - outdated deps
// 2 - stale deps but no outdated
type ExitCode = 0 | 1 | 2;

const { argv } = yargs
  .scriptName('rotten-deps')
  .usage('$0 [options]')
  .option('config-path', {
    demandOption: true,
    description: 'path to rotten-deps configuration file',
    type: 'string',
  })
  .option('json', {
    description: 'output will be json instead of table',
    boolean: true,
    requiresArg: false,
  });

if (argv.help) yargs.showHelp();

const maestro = (configPath: string): void => {
  const configReader = configuration.createFileReader(configPath);

  const processConfigData = (x: string): Promise<Config> => new Promise(resolve => {
    resolve(JSON.parse(x));
  });

  const buildConfigObject = (x: Config): Promise<Config> => new Promise(resolve => {
    resolve(configuration.createConfig(x));
  });

  const processReport = (x: ReportData[]|Error): Promise<ProcessedReport> => new Promise(resolve => {
    if (x instanceof Error) throw x;

    let exitCode: ExitCode = 0;
  
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
      isStale,
    }) => {
      if (!isIgnored && exitCode !== 1 && isStale) exitCode = 2;
      if (!isIgnored && isOutdated) exitCode = 1;
      const outdated = isIgnored ? 'ignored' : isOutdated;
      table.push([name, current, latest, daysOutdated, outdated]);
    });

    resolve({
      table: table.toString(),
      json: JSON.stringify(x),
      status: exitCode,
    });
  });

  const shoutReport = ({ table, json, status }: ProcessedReport): void => {
    if (argv.json) console.log(json);
    else console.log(table);
    process.exit(status);
  }

  configReader()
    .then(processConfigData)
    .then(buildConfigObject)
    .then(generateReport)
    .then(processReport)
    .then(shoutReport);
};

const configPath = argv['config-path'];

if (isAbsolute(configPath)) {
  maestro(configPath);
} else {
  const maybePath = pathResolve(configPath);
  if (!existsSync(maybePath)) yargs.exit(1, new Error(`${configPath} could not be resolved from configuration`));
  maestro(maybePath);
}
