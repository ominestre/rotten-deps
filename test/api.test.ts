import { join } from 'path';
import { readFileSync } from 'fs';
import { assert } from 'chai';
import { spy } from 'sinon';
import { generateReport } from '../src/lib/index';
import { createOutdatedRequest } from '../src/lib/npm-interactions';
import { restoreDir, sampleAppDir, noInstallDir } from './helpers/test-directory-helpers';

const sampleConfigDir = join(__dirname, './dummies/');
const getTestConfig = (configID: string) => JSON.parse(readFileSync(`${sampleConfigDir}/${configID}.json`, { encoding: 'utf8' }));

describe('API integrations', () => {
  afterEach(restoreDir);

  it('generate a report using a config with only rules', async () => {
    sampleAppDir();
    const config = getTestConfig('rules-only-config');
    const maybeReport = await generateReport(config);

    if (maybeReport instanceof Error) throw maybeReport;

    const filter = (name: string) => maybeReport.data.filter(x => x.name === name).shift();
    const leftPadLOL = filter('left-pad');
    const mocha = filter('mocha');
    const chai = filter('chai');

    if (leftPadLOL) {
      assert.equal(leftPadLOL?.name, 'left-pad');
      assert.equal(leftPadLOL?.current, '1.2.0');
      assert.isTrue(leftPadLOL?.daysOutdated < 9000, 'Days Outdated should be less than 9000');
      assert.isFalse(leftPadLOL?.isOutdated, 'left-pad should not be flagged as outdated');
      assert.isTrue(leftPadLOL?.isStale, 'left-pad 1.2 should be flagged as stale since 1.3 is latest');
    } else assert.fail('Left pad data was missing');

    if (mocha) {
      assert.equal(mocha.name, 'mocha');
      assert.equal(mocha.current, '2.5.3');
      assert.isTrue(mocha.isIgnored);
      assert.isFalse(mocha.isOutdated);
      assert.isFalse(mocha.isStale);
    } else assert.fail('Mocha data was missing');

    if (chai) {
      assert.equal(chai.name, 'chai');
      assert.equal(chai.current, '1.8.1');
      assert.isTrue(chai.daysOutdated > 1800);
      assert.isTrue(chai.isOutdated);
      assert.isFalse(chai.isIgnored);
      assert.isFalse(chai.isStale);
    } else assert.fail('Chai data was missing');
  }).timeout(20000);

  it('Uses optional reporter hooks', async () => {
    sampleAppDir();
    const config = getTestConfig('rules-only-config');

    const totalSpy = spy();
    const reportSpy = spy();
    const doneSpy = spy();
  
    const maybeReport = await generateReport(config, { report: reportSpy, setTotal: totalSpy, done: doneSpy });
    const outdatedRequest = createOutdatedRequest();
    const outdated = await outdatedRequest();
    const outdatedCount = Object.keys(outdated).length;

    assert.isTrue(totalSpy.calledOnce);
    assert.isTrue(totalSpy.calledWith(outdatedCount));

    assert.isTrue(reportSpy.called);
    assert.equal(reportSpy.callCount, outdatedCount);

    assert.isTrue(doneSpy.calledOnce);
  }).timeout(20000);

  it('generates a report with warnings when you don\'t install first', async () => {
    noInstallDir();
    const config = getTestConfig('rules-only-config');
    const maybeReport = await generateReport(config);

    if (maybeReport instanceof Error) throw maybeReport;

    assert.equal(maybeReport.kind, 'warning', 'The report type should be a report with warnings');
  }).timeout(20000);

  it('Displays days allowed and correctly determines if outdated', async () => {
    sampleAppDir();
    const config = getTestConfig('rules-only-config');
    const maybeReport = await generateReport(config);

    if (maybeReport instanceof Error) assert.fail();
    
    maybeReport.data.forEach(report => {
      assert.exists(report.daysAllowed);
      assert.isFalse(report.daysAllowed > report.daysOutdated && report.isOutdated);
      assert.isFalse(report.daysAllowed < report.daysOutdated && !report.isOutdated);
    });
  }).timeout(20000);

  /*  TODO Sitting on this one because you should just be using npm or yarn outdated.
      Not sure I want to support this scenario */
  xit('generate a report without config');
  xit('generate a report using only global settings and no rules');
});
