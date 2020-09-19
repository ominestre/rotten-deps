import { join } from 'path';
import { readFileSync } from 'fs';
import { assert } from 'chai';
import { generateReport } from '../src/lib/index';


const defaultDir = process.cwd();
const changeDir = (directory: string) => () => process.chdir(directory);
const restoreDir = changeDir(defaultDir);
const sampleAppDir = changeDir(
  join(__dirname, './dummies/sample-app'),
);


const sampleConfigDir = join(__dirname, './dummies/');
const getTestConfig = (configID: string) => JSON.parse(readFileSync(`${sampleConfigDir}/${configID}.json`, { encoding: 'utf8' }));


describe('API integrations', () => {
  afterEach(restoreDir);

  it('Should generate a report using a config with only rules', async () => {
    sampleAppDir();
    const config = getTestConfig('rules-only-config');
    const maybeReport = await generateReport(config);

    if (maybeReport instanceof Error) throw maybeReport;

    const filter = (name: string) => maybeReport.filter(x => x.name === name).shift();
    const leftPadLOL = filter('left-pad');
    const mocha = filter('mocha');
    const chai = filter('chai');

    // https://github.com/microsoft/TypeScript/issues/19573
    // created in 2017 for supporting block ignore :(

    // @ts-ignore
    assert.equal(leftPadLOL.name, 'left-pad');
    // @ts-ignore
    assert.equal(leftPadLOL.current, '1.2.0');
    // @ts-ignore
    assert.isTrue(leftPadLOL.daysOutdated < 9000, 'Days Outdated should be less than 9000');
    // @ts-ignore
    assert.isFalse(leftPadLOL.isOutdated, 'left-pad should not be flagged as outdated');
    // @ts-ignore
    assert.isTrue(leftPadLOL.isStale, 'left-pad 1.2 should be flagged as stale since 1.3 is latest');

    // @ts-ignore
    assert.equal(mocha.name, 'mocha');
    // @ts-ignore
    assert.equal(mocha.current, '2.5.3');
    // @ts-ignore
    assert.isTrue(mocha.isIgnored);
    // @ts-ignoreZS
    assert.isFalse(mocha.isOutdated);
    // @ts-ignore
    assert.isFalse(mocha.isStale);

    // @ts-ignore
    assert.equal(chai.name, 'chai');
    // @ts-ignore
    assert.equal(chai.current, '1.8.1');
    // @ts-ignore
    assert.isTrue(chai.daysOutdated > 1800);
    // @ts-ignore
    assert.isTrue(chai.isOutdated);
    // @ts-ignore
    assert.isFalse(chai.isIgnored);
    // @ts-ignore
    assert.isFalse(chai.isStale);
  }).timeout(20000);

  /*  Sitting on this one because you should just be using npm or yarn outdated.
      Not sure I want to support this scenario */
  xit('Could generate a report without config');
  xit('Should generate a report using only global settings and no rules');
});
