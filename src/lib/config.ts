import * as util from 'util';
import * as fs from 'fs';


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

type MaybeConfig = Config | ErrorReport;
type MaybeRules = ParsedRules | ErrorReport;


export const parseRules = ({ rules }): MaybeRules => {
  let problems: Problem[] = [];
  let isValidConfig = true;
  let parsedRules: Rule[] = [];

  rules.forEach(({ dependencyName, ignore = false, daysUntilExpiration = 0 }, i) => {
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
        error: `Rule ${i} is missing required field dependencyName`,
        recommendation: 'You must provide a dependency name of type string',
      });
    }

    if (typeof ignore !== 'boolean') {
      isRuleValid = false;
      issues.push({
        error: `Rule ${i} has a type mismatch for ignore`,
        recommendation: 'The ignore field must be of type boolean',
      });
    }

    if (typeof daysUntilExpiration !== 'number') {
      isRuleValid = false;
      issues.push({
        error: `Rule ${i} has a type mismatch for daysUntilExpiration`,
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
    error: new Error('Configuration contains invalid config'),
  };

  return {
    kind: 'rules',
    rules: parsedRules,
  };
}


export const createConfig = (config: Config): MaybeConfig => {
  const maybeRules = parseRules(config);
  switch (maybeRules.kind) {
    case 'error':
      return maybeRules;
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
