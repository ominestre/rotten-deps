import { assert } from 'chai';
import * as path from 'path';
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
    // TODO should also test the contents of the errors to check correct messaging
    const a = configLib.createConfig({
      rules: [
        { dependencyName: 'foo', ignore: false, daysUntilExpiration: 30 },
        { dependencyName: 'bar', ignore: true, daysUntilExpiration: 0 },
      ],
    });

    assert.equal(a.kind, 'config');

    const b = configLib.createConfig({
      rules: [
        { dependencyName: 'foo', ignore: true, daysUntilExpiration: 300 },
        { dependencyName: null, ignore: true, daysUntilExpiration: 9001 },
      ],
    });

    assert.equal(b.kind, 'error');

    const c = configLib.createConfig({
      rules: [
        // @ts-ignore intentionally passing bad type
        { dependencyName: 'foo', ignore: 'maybe', daysUntilExpiration: 30 },
      ],
    });

    assert.equal(c.kind, 'error');

    const d = configLib.createConfig({
      rules: [
        // @ts-ignore intentionally passing bad type
        { dependencyName: 'banana', ignore: true, daysUntilExpiration: 'thirteen' },
      ],
    });

    assert.equal(d.kind, 'error');
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
