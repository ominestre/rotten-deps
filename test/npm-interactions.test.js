import { assert } from 'chai';
import npmLib from '../src/lib/npm-interactions';


/**
 * `process.platform` is a read only property that can only be changed via the
 * `Object.defineProperty` method
 * @param {string} platform
 */
const setProcessPlatform = platform => () => Object.defineProperty(process, 'platform', { value: platform });

const defaultPlatform = process.platform;
const restorePlatform = setProcessPlatform(defaultPlatform);
const setPlatformWindows = setProcessPlatform('win32');
const setPlatformDarwin = setProcessPlatform('darwin');

describe('NPM Interaction Library', () => {
  it('Should create a function for outdated and view requests for windows machines', () => {
    setPlatformWindows();
    const getOutdatedRequest = npmLib.createOutdatedRequest();
    const getDetailsRequest = npmLib.createDetailsRequest('banana');

    assert(typeof getOutdatedRequest === 'function');
    assert(typeof getDetailsRequest === 'function');
    restorePlatform();
  });

  it('Should create a function for outdated and view requests for non-windows machines', () => {
    setPlatformDarwin();
    const getOutdatedRequest = npmLib.createOutdatedRequest();
    const getDetailsRequest = npmLib.createDetailsRequest('banana');

    assert(typeof getOutdatedRequest === 'function');
    assert(typeof getDetailsRequest === 'function');
    restorePlatform();
  });

  it('Should prepare a request for NPM outdate', async () => {
    const getOutdatedRequest = npmLib.createOutdatedRequest();
    const response = await getOutdatedRequest();
    assert(typeof response === 'object');
  }).timeout(4000);

  it('Should prepare a request for NPM view', async () => {
    const getDetailsRequest = npmLib.createDetailsRequest('express');
    const response = await getDetailsRequest();
    assert.equal(response.name, 'express');
  }).timeout(4000);
});

