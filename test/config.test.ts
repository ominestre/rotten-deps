import { assert } from 'chai';
import * as path from 'path';
import * as sinon from 'sinon';
import configLib from '../src/lib/config';

describe('Configuration library', () => {
  it('Should read a configuration file from filesystem', (done) => {
    const filePath = path.resolve(__dirname, 'dummies/config-file.json');
    const fileRequest = configLib.createFileReader(filePath);

    fileRequest()
      .then(data => {
        // @ts-ignore
        const json = JSON.parse(data);
        assert.deepEqual(json, { foo: 0 });
        done();
      });
  });

  it('Should validate each rule from the user config', () => {
    sinon.stub(console, 'log');

    // TODO should also test the contents of the errors to check correct messaging
    const a = configLib.createConfig({
      rules: [
        { dependencyName: 'foo', ignore: false, daysUntilExpiration: 30 },
        { dependencyName: 'bar', ignore: true, daysUntilExpiration: 0 },
      ],
    });

    assert.equal(a.kind, 'config');

    const b = configLib.createConfig.bind(null, {
      rules: [
        { dependencyName: 'foo', ignore: true, daysUntilExpiration: 300 },
        // @ts-ignore intentionally passing bad values
        { dependencyName: null, ignore: true, daysUntilExpiration: 9001 },
      ],
    });

    assert.throws(b, /Configuration file contains invalid config/);

    const c = configLib.createConfig.bind(null, {
      rules: [
        // @ts-ignore intentionally passing bad type
        { dependencyName: 'foo', ignore: 'maybe', daysUntilExpiration: 30 },
      ],
    });

    assert.throws(c, /Configuration file contains invalid config/);

    const d = configLib.createConfig.bind(null, {
      rules: [
        // @ts-ignore intentionally passing bad type
        { dependencyName: 'banana', ignore: true, daysUntilExpiration: 'thirteen' },
      ],
    });

    assert.throws(d, /Configuration file contains invalid config/);

    sinon.restore();
  });

  it('Should default ignore to false if it is not specified', () => {
    const rules = [
      { dependencyName: 'trevorforget', daysUntilExpiration: 9000 },
      { dependencyName: 'banana', ignore: true, daysUntilExpiration: 13 },
    ];

    const { kind, ...maybeConfig } = configLib.createConfig({ rules });
    assert.equal(kind, 'config');
    assert.deepEqual(maybeConfig, {
      rules: [
        { dependencyName: 'trevorforget', ignore: false, daysUntilExpiration: 9000 },
        { dependencyName: 'banana', ignore: true, daysUntilExpiration: 13 },
      ],
    });
  });
});
