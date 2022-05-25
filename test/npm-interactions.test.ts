import { assert } from 'chai';
import npmLib from '../src/lib/npm-interactions';
import { restoreDir, sampleAppDir } from './helpers/test-directory-helpers';


/**
 * `process.platform` is a read only property that can only be changed via the
 * `Object.defineProperty` method
 * @param {string} platform
 */
const setProcessPlatform = (platform: string) =>
  () => Object.defineProperty(process, 'platform', { value: platform });

const defaultPlatform = process.platform;
const restorePlatform = setProcessPlatform(defaultPlatform);
const setPlatformWindows = setProcessPlatform('win32');
const setPlatformDarwin = setProcessPlatform('darwin');

describe('NPM Interaction Library', () => {
  it('Should create functions for interactions on windows machines', () => {
    setPlatformWindows();
    const getOutdatedRequest = npmLib.createOutdatedRequest();
    const getDetailsRequest = npmLib.createDetailsRequest('banana');
    const getListRequest = npmLib.createListRequest();

    assert(typeof getOutdatedRequest === 'function');
    assert(typeof getDetailsRequest === 'function');
    assert(typeof getListRequest === 'function');
    restorePlatform();
  });

  it('Should create functions for interactions on non-windows machines', () => {
    setPlatformDarwin();
    const getOutdatedRequest = npmLib.createOutdatedRequest();
    const getDetailsRequest = npmLib.createDetailsRequest('banana');
    const getListRequest = npmLib.createListRequest();

    assert(typeof getOutdatedRequest === 'function');
    assert(typeof getDetailsRequest === 'function');
    assert(typeof getListRequest === 'function');
    restorePlatform();
  });

  it('Should prepare a request for NPM outdate', async () => {
    const getOutdatedRequest = npmLib.createOutdatedRequest();
    const response = await getOutdatedRequest();
    assert(typeof response === 'object');
  }).timeout(8000);

  it('Should prepare a request for NPM view', async () => {
    const getDetailsRequest = npmLib.createDetailsRequest('express');
    const response = await getDetailsRequest();
    assert.equal(response.name, 'express');
  }).timeout(8000);

  it('Should get a list of installed dependencies', async () => {
    sampleAppDir();
    const getListRequest = npmLib.createListRequest();
    const response = await getListRequest();

    assert(!(response instanceof Error));

    const listOfInstalledDependencies = response.getListOfInstalledDependencies();
    assert(listOfInstalledDependencies.includes('mocha'));
    restoreDir();
  }).timeout(8000);

  it('Should get a list of installed prod dependencies');
});

