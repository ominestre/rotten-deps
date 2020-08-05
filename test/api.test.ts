import { join } from 'path';
import { readFileSync } from 'fs';
import { assert } from 'chai';
import { generateReport } from '../src/lib/index';


const defaultDir = process.cwd();
const changeDir = (directory) => () => process.chdir(directory);
const restoreDir = changeDir(defaultDir);
const sampleAppDir = changeDir(
  join(__dirname, './dummies/sample-app'),
);


const sampleConfigDir = join(__dirname, './dummies/');
const getTestConfig = (configID) => JSON.parse(readFileSync(`${sampleConfigDir}/${configID}.json`, { encoding: 'utf8' }));


describe('API integrations', () => {
  afterEach(restoreDir);

  it('Should generate a report using a config with only rules', async () => {
    sampleAppDir();
    const config = getTestConfig('rules-only-config');
    const maybeReport = await generateReport(config);

    if (maybeReport instanceof Error) throw maybeReport;

    const filter = name => maybeReport.filter(x => x.name === name).shift();
    const leftPadLOL = filter('left-pad');
    const mocha = filter('mocha');
    const chai = filter('chai');

    assert.equal(leftPadLOL.name, 'left-pad');
    assert.equal(leftPadLOL.current, '1.2.0');
    assert.isTrue(leftPadLOL.daysOutdated < 9000, 'Days Outdated should be less than 9000');
    assert.isFalse(leftPadLOL.isOutdated, 'left-pad should not be flagged as outdated');
    assert.isTrue(leftPadLOL.isStale, 'left-pad 1.2 should be flagged as stale since 1.3 is latest');

    assert.equal(mocha.name, 'mocha');
    assert.equal(mocha.current, '2.5.3');
    assert.isTrue(mocha.isIgnored);
    assert.isFalse(mocha.isOutdated);
    assert.isFalse(mocha.isStale);

    assert.equal(chai.name, 'chai');
    assert.equal(chai.current, '1.8.1');
    assert.isTrue(chai.daysOutdated > 1800);
    assert.isTrue(chai.isOutdated);
    assert.isFalse(chai.isIgnored);
    assert.isFalse(chai.isStale);
  }).timeout(20000);

  /*  Sitting on this one because you should just be using npm or yarn outdated.
      Not sure I want to support this scenario */
  xit('Could generate a report without config');
  xit('Should generate a report using only global settings and no rules');
});
