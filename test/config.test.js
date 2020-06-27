import { assert } from 'chai';
import * as path from 'path';
import configLib from '../src/config';

describe('Configuration library', () => {
  it('Should read a configuration file from filesystem', (done) => {
    const filePath = path.resolve(__dirname, 'dummies/config-file.json');
    const fileRequest = configLib.createFileReader(filePath);

    fileRequest()
      .then(data => {
        const json = JSON.parse(data);
        assert.deepEqual(json, { foo: 0 });
        done();
      });
  });

  xit('Should validate each rule from the user config');

  it('Should create a standard config object', () => {
    const { createConfig } = configLib;
    assert.deepEqual(createConfig({ foo: 1, bar: 2 }), { rules: [], foo: 1, bar: 2 });
    assert.deepEqual(createConfig({}), { rules: [] });
    assert.deepEqual(createConfig({ rules: ['one'], foo: 0 }), { rules: ['one'], foo: 0 });
  });
});
