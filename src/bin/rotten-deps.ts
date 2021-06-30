#!/usr/bin/env node

/**
 * CLI options handling and orchestration
 * 
 * @module
 * @hidden
 */

import * as yargs from 'yargs';
import {
  isAbsolute,
  resolve as pathResolve,
} from 'path';
import cliProgress from 'cli-progress';
import Table from 'cli-table';
import { existsSync } from 'fs';
import { configuration, generateReport } from '../lib/index';

import type { ReportResponse } from '../lib/index';
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

yargs
  .scriptName('rotten-deps')
  .usage('$0 [options]')
  .option('config-path', {
    description: 'path to rotten-deps configuration file',
    type: 'string',
  })
  .option('json', {
    description: 'output will be json instead of table',
    boolean: true,
    requiresArg: false,
  })
  .option('default-expiration', {
    description: `sets a default grace period for all dependencies. this cannot be used with a configuration file.
      you should specifiy this there instead`,
    type: 'number',
    conflicts: 'config-path',
  })
  .option('progress', {
    description: 'displays a progress bar',
    boolean: true,
    requiresArg: false,
  })
  .parseAsync()
  .then(argv => {
    if (argv.help) yargs.showHelp();

    const progressBarConfig: cliProgress.Options = {
      hideCursor: true,
      format: ' {bar} | {task} | {value}/{total}',
    }


    const maestro = (config: Config): void => {
      const buildConfigObject = (x: Config): Promise<Config> => new Promise(resolve => {
        resolve(configuration.createConfig(x));
      });

      const processReport = (x: ReportResponse|Error): Promise<ProcessedReport> => new Promise(resolve => {
        if (x instanceof Error) throw x;
        
        if (x.kind === 'warning') {
          if (x.hasPreinstallWarning) console.warn('Unable to accurately calculate days outdated unless you use npm/yarn install first');
        }

        let exitCode: ExitCode = 0;
      
        const table = new Table({
          head: ['name', 'current version', 'latest version', 'days outdated', 'is outdated'],
        });

        x.data.forEach(({
          name,
          current,
          latest,
          daysOutdated,
          isOutdated,
          isIgnored,
          isStale,
        }) => {
          // if the exit code is already 1 for error we don't want to downgrade to warn
          if (!isIgnored && exitCode !== 1 && isStale) exitCode = 2;
          if (!isIgnored && isOutdated) exitCode = 1;
          const outdated = isIgnored ? 'ignored' : isOutdated;
          table.push([name, current, latest, daysOutdated, outdated]);
        });

        resolve({
          table: table.toString(),
          json: JSON.stringify(x.data),
          status: exitCode,
        });
      });

      const shoutReport = ({ table, json, status }: ProcessedReport): void => {
        if (argv.json) console.log(json);
        else console.log(table);
        process.exit(status);
      }

      buildConfigObject(config)
        .then(
          (config) => {
            const progress = new cliProgress.SingleBar(progressBarConfig, cliProgress.Presets.shades_grey);

            const reporter = argv.progress ? {
              setTotal: (total: number) => progress.start(total, 0, { task: 'generating report' }),
              report: () => {
                progress.increment();
              },
              done: () => progress.stop(),
            } : undefined;

            return generateReport(config, reporter);
          }
        )
        .then(processReport)
        .then(shoutReport);
    };

    const configPath = argv['config-path'];
    const defaultExpiration = argv['default-expiration'];

    const configParser = (raw: string): Promise<Config> => new Promise(resolve => resolve(JSON.parse(raw)));

    if (configPath && isAbsolute(configPath)) {
      const configReader = configuration.createFileReader(configPath);
      configReader()
        .then(configParser)
        .then(maestro);
    } else if (configPath) {
      const maybePath = pathResolve(configPath);
      if (!existsSync(maybePath)) yargs.exit(1, new Error(`${configPath} could not be resolved from configuration`));
      const configReader = configuration.createFileReader(configPath);
      configReader()
        .then(configParser)
        .then(maestro);
    } else {
      let config: Config = {
        rules: [],
      };

      if (defaultExpiration) config.defaultExpiration = defaultExpiration;

      maestro(config);
    }
  });
