import * as util from 'util';
import * as fs from 'fs';
import * as Table from 'cli-table';


interface Rule {
  readonly dependencyName: string;
  readonly ignore?: boolean;
  readonly daysUntilExpiration?: number;
}

export interface Config {
  readonly kind?: 'config';
  readonly rules: Rule[];
}

interface FileReader {
  (): Promise<String>;
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

export const parseRules = ({ rules }): MaybeRules => {
  let problems: Problem[] = [];
  let isValidConfig = true;
  let parsedRules: Rule[] = [];

  rules.forEach(({ dependencyName, ignore = false, daysUntilExpiration = 0 }, i) => {
    const ruleNumber = i + 1;
    let rule = {
      dependencyName,
      ignore,
      daysUntilExpiration,
    };

    let isRuleValid = true;
    let issues: Issue[] = [];

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
      })
    }

    if (!isRuleValid) {
      isValidConfig = false;
      problems.push({
        dependencyName,
        issues,
      })
    } else {
      parsedRules.push(rule);
    }
  });

  if (!isValidConfig) return {
    kind: 'error',
    message: 'Configuration file contains invalid config',
    report: problems,
    error: new Error('Configuration file contains invalid config'),
  };

  return {
    kind: 'rules',
    rules: parsedRules,
  };
}


export const createConfig = (config: Config): Config => {
  const maybeRules = parseRules(config);
  switch (maybeRules.kind) {
    case 'error':
      const table = new Table({
        head: ['dependency', 'issue', 'recommendation'],
      });

      maybeRules.report.forEach(x => {
        const dep = String(x.dependencyName);
        x.issues.forEach(y => {
          table.push([dep, y.error, y.recommendation])
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
  }
};


/**
 * Creates a filereader function for fetching the contents of a config 
 * file at the provided path.
 * @param absoluteFilePath absolute path to the configuration file
 */
export const createFileReader = (absoluteFilePath: string): FileReader => {
  const readFilePromise = util.promisify(fs.readFile);
  return readFilePromise.bind(null, absoluteFilePath, { encoding: 'utf8' });
};


export default {
  createFileReader,
  createConfig,
};
