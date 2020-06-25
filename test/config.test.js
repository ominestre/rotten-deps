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

  it('Should create a standard config object', () => {
    const { createConfig } = configLib;
    assert.deepEqual(createConfig({ foo: 1, bar: 2 }), { foo: 1, bar: 2 });
    assert.deepEqual(createConfig({}), {});
  });
});
