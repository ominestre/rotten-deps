#!/usr/bin/env node

import * as yargs from 'yargs';
import { isAbsolute } from 'path';
import * as Table from 'cli-table';
import { configuration, generateReport } from '../lib/index';

const { argv } = yargs
  .scriptName('rotten-deps')
  .usage('$0 [options]')
  .option('config-path', {
    demand: true,
    description: 'path to rotten-deps configuration file',
    type: 'string',
  });

if (argv.help) yargs.showHelp();

const configPath = argv['config-path'];

if (isAbsolute(configPath)) {
  const configReader = configuration.createFileReader(configPath);

  const processConfigData = raw => new Promise(resolve => {
    resolve(JSON.parse(raw));
  });

  const buildConfigObject = data => new Promise(resolve => {
    resolve(configuration.createConfig(data));
  });

  const processReport = maybe => new Promise(resolve => {
    if (maybe.isError()) throw maybe.flatten();

    const report = maybe.flatten();

    if (argv.json) resolve(report);

    const table = new Table({
      head: ['name', 'current version', 'latest version', 'days outdated', 'is outdated'],
    });

    report.forEach(({
      name,
      current,
      latest,
      daysOutdated,
      isOutdated,
    }) => {
      table.push([name, current, latest, daysOutdated, isOutdated]);
    });

    resolve(table.toString());
  });

  configReader()
    .then(processConfigData)
    .then(buildConfigObject)
    .then(generateReport)
    .then(processReport)
    .then(console.log);
} else {
  console.log('no data');
}
