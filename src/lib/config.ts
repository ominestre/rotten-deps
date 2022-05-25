/**
 * Rotten Deps configuration library
 *
 * @module
 */

import Table from 'cli-table3';
import { readFileSync } from 'fs';


interface Rule {
  readonly dependencyName: string;
  readonly ignore?: boolean;
  readonly daysUntilExpiration?: number;
  readonly reason?: string;
}

export interface Config {
  defaultExpiration?: number;
  ignoreDevDependencies?: boolean,
  readonly kind?: 'config';
  readonly rules: Rule[];
}

interface FileReader {
  (): Promise<string>;
}

interface Issue {
  error: string;
  recommendation: string;
}

interface Problem {
  readonly dependencyName: string;
  readonly issues: Issue[];
}

interface ParsedRules {
  kind: 'rules';
  rules: Rule[];
}

interface ErrorReport {
  readonly kind: 'error';
  readonly message: string;
  readonly report: Problem[];
  readonly error: Error;
}

type MaybeRules = ParsedRules | ErrorReport;


/**
 * reviews each rule of a configuration to determine validity
 * generates a report of violations with recommendations on how to resolve
 * @param config rotten deps configuration object
 */
const parseRules = (config: Config): MaybeRules => {
  const { rules } = config;
  const problems: Problem[] = [];
  const parsedRules: Rule[] = [];

  let isValidConfig = true;

  rules.forEach(({
    dependencyName,
    ignore = false,
    daysUntilExpiration = 0,
    reason = '',
  }, i) => {
    const ruleNumber = i + 1;
    const rule = {
      dependencyName,
      ignore,
      daysUntilExpiration,
      reason,
    };

    let isRuleValid = true;
    const issues: Issue[] = [];

    if (typeof dependencyName !== 'string' || dependencyName.length <= 0) {
      isRuleValid = false;
      issues.push({
        error: `Rule ${ruleNumber} is missing required field dependencyName`,
        recommendation: 'You must provide a dependency name of type string',
      });
    }

    if (typeof ignore !== 'boolean') {
      isRuleValid = false;
      issues.push({
        error: `Rule ${ruleNumber} has a type mismatch for ignore`,
        recommendation: 'The ignore field must be of type boolean',
      });
    }

    if (typeof daysUntilExpiration !== 'number') {
      isRuleValid = false;
      issues.push({
        error: `Rule ${ruleNumber} has a type mismatch for daysUntilExpiration`,
        recommendation: 'The daysUntilExpiration field must be of type number',
      });
    }

    if (typeof reason !== 'string') {
      isRuleValid = false;
      issues.push({
        error: `Rule ${ruleNumber} has a type mismatch for the reason property`,
        recommendation: 'The value for reason must be a string',
      });
    }

    if (!isRuleValid) {
      isValidConfig = false;
      problems.push({
        dependencyName,
        issues,
      });
    } else {
      parsedRules.push(rule);
    }
  });

  if (!isValidConfig) {
    return {
      kind: 'error',
      message: 'Configuration file contains invalid config',
      report: problems,
      error: new Error('Configuration file contains invalid config'),
    };
  }

  return {
    kind: 'rules',
    rules: parsedRules,
  };
};


/**
 * Validates a raw configuration file and generates a report if any rules are
 * misconfigured.
 * @param config rotten deps configuration object
 */
export const createConfig = (config: Config): Config => {
  const maybeRules = parseRules(config);
  const table = new Table({
    head: ['dependency', 'issue', 'recommendation'],
  });

  switch (maybeRules.kind) {
    case 'error':
      maybeRules.report.forEach(x => {
        const dep = String(x.dependencyName);
        x.issues.forEach(y => {
          table.push([dep, y.error, y.recommendation]);
        });
      });

      console.log(table.toString());
      throw maybeRules.error;
    case 'rules':
      return {
        kind: 'config',
        ...config,
        rules: maybeRules.rules,
      };
    default:
      throw new Error('Parsed rules was neither collection of rules or error');
  }
};


/**
 * Creates a filereader function for fetching the contents of a config
 * file at the provided path.
 * @param absoluteFilePath absolute path to the configuration file
 */
export const createFileReader = (absoluteFilePath: string): FileReader =>
  async () => {
    const data = readFileSync(absoluteFilePath, { encoding: 'utf-8' });
    return String(data);
  };


export default {
  createFileReader,
  createConfig,
};
