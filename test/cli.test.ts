import { spawnSync } from 'child_process';
import { join } from 'path';
import { assert } from 'chai';

import type { PackageDetails } from '../src/lib/npm-interactions';

interface RottenRunnerConfig {
  enableConfig?: boolean,
  enableJSON?: boolean,
  configFileName?: string,
  defaultDays?: number,
  testContainer?: 'sample-app' | 'sample-app-no-install',
}

type ConfigName = 'rules-only-config.json' | 'only-stale.json' | 'no-outdated.json';

const rotten = ({
  enableConfig = true,
  enableJSON = false,
  configFileName = '',
  defaultDays = 0,
  testContainer = 'sample-app',
}: RottenRunnerConfig) => {
  const configPath = join(__dirname, `dummies/${configFileName}`);
  const testContainerPath = join(__dirname, `dummies/${testContainer}/`);
  const binaryPath = join(__dirname, '../bin/rotten-deps');

  let args = [binaryPath];

  if (enableConfig) {
    args.push('--config-path');
    args.push(configPath);
  }

  if (enableJSON) args.push('--json');

  if (defaultDays) {
    args.push('--default-expiration');
    args.push(String(defaultDays));
  }

  return spawnSync(
    'node',
    args,
    { cwd: testContainerPath, timeout: 15000, encoding: 'utf8' },
  );
};

describe('CLI', () => {
  it('generate a report and exit 1 for outdated', async () => {
    const { status, stdout, stderr } = await rotten({ configFileName: 'rules-only-config.json' });
    assert.equal(status, 1, 'rules only config should have outdated dependencies');
    assert.isTrue(stdout.includes('left-pad'));
    assert.isTrue(stdout.includes('mocha'));
    assert.isTrue(stdout.includes('chai'));
    assert.equal(stderr.length, 0, 'there should not be any error output for rules only config');
  }).timeout(20000);

  it('generate a report and exit 0 for no outdated', async () => {
    const { status } = await rotten({ configFileName: 'no-outdated.json' });
    assert.equal(status, 0);
  }).timeout(20000);

  it('generate a report and exit 2 for stale dependencies', async () => {
    const { status } = await rotten({ configFileName: 'only-stale.json' });
    assert.equal(status, 2, 'only stale should exit with code 2');
  }).timeout(20000);

  it('output raw json when the json flag is passed', async () => {
    const { stdout } = await rotten({ configFileName: 'rules-only-config.json', enableJSON: true});
    const json = JSON.parse(stdout);
    const chai = json.filter((x: PackageDetails) => x.name === 'chai').shift();
    assert.equal(chai.name, 'chai');
    assert.isFalse(chai.isIgnored);
    assert.isTrue(chai.isOutdated);
  }).timeout(20000);

  it('generate a report and exit 0 when not using a config path and using default expiration instead', async () => {
    const { status } = await rotten({ enableConfig: false,  defaultDays: 90000000 });
    assert.equal(status, 0);
  }).timeout(20000);

  it('generate a report with a warning when run without using npm/yarn install first', async () => {
    const { status, stderr } = await rotten({ configFileName: 'rules-only-config.json', testContainer: 'sample-app-no-install' });

    assert.equal(status, 2, 'rules only config should resolve with warnings');
    assert.isTrue(
      stderr.includes('Unable to accurately calculate days outdated unless you use npm/yarn install first'),
      'output should have a warning indicating to run npm/yarn install first',
    );
  }).timeout(20000);
});
