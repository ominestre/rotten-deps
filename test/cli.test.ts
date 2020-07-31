import { spawnSync } from 'child_process';
import { join } from 'path';
import { assert } from 'chai';

interface CommandResponse {
  status: number;
  stdout: string;
  stderr: string;
}

type ConfigName = 'rules-only-config.json' | 'only-stale.json' | 'no-outdated.json';

const rotten = (configFileName: ConfigName, enableJSON = false): CommandResponse => {
  const configPath = join(__dirname, `dummies/${configFileName}`);
  const dummyApp = join(__dirname, 'dummies/sample-app/');
  const binaryPath = join(__dirname, '../bin/rotten-deps');

  const args = [binaryPath, '--config-path', configPath];

  if (enableJSON) args.push('--json');

  const out = spawnSync(
    'node',
    args,
    { cwd: dummyApp, timeout: 15000, encoding: 'utf8' },
  );

  const { status, stdout, stderr } = out;

  return { status, stdout, stderr }
};

describe('CLI', () => {
  it('should generate a report and exit 1 for outdated', async () => {
    const { status, stdout, stderr } = await rotten('rules-only-config.json');
    assert.equal(status, 1, 'rules only config should have outdated dependencies');
    assert.isTrue(stdout.includes('left-pad'));
    assert.isTrue(stdout.includes('mocha'));
    assert.isTrue(stdout.includes('chai'));
    assert.equal(stderr.length, 0, 'there should not be any error output for rules only config');
  }).timeout(20000);

  it('should generate a report and exit 0 for no outdated', async () => {
    const { status } = await rotten('no-outdated.json');
    assert.equal(status, 0);
  }).timeout(20000);

  it('should generate a report and exit 2 for stale dependencies', async () => {
    const { status } = await rotten('only-stale.json');
    assert.equal(status, 2, 'only stale should exit with code 2');
  }).timeout(20000);

  it('should output raw json when the json flag is passed', async () => {
    const { stdout } = await rotten('rules-only-config.json', true);
    const json = JSON.parse(stdout);
    const chai = json.filter(x => x.name === 'chai').shift();
    assert.equal(chai.name, 'chai');
    assert.isFalse(chai.isIgnored);
    assert.isTrue(chai.isOutdated);
  }).timeout(20000);
});
