# rotten deps

The command `npm outdated` only has two endpoints which are pass or fail. This dichotomy isn't very useful for CI
flows which have pass, fail, or warn. This CLI utility combines `npm outdated` and `npm view` in order to establish
a compliance period for dependency checks. This way if a dependency update is within your compliance period you can
trigger a warn or if it's beyond your compliance period it can trigger a fail.

## API

### Config Lib: `src/config.ts`

#### configuration.createFileReader( absoluteFilePath: string ) => function

Creates a wrapper of `fs.readFileSync` using the provided absolute path for execution down
the road.

```javascript
import { configuration } from '@ominestre/rotten-deps';

const foo = async () => {
  const reader = configuration.createFileReader('/some/absolute/path');
  const data = await reader();
  // do stuff with data
}
```

#### configuration.creatConfig( userConfig = {} ) => object

Builds a user configuration object **without any validation** by taking a default config and
overlaying the provided user config.

### NPM Interactions Lib: `src/npm-interactions.ts`

#### npm.createOutdatedRequest() => function() => Promise<object>

Creates a deferred call to `npm outdated --json` that can be invoked later. The inner function
returns a promise which handles a successful list of outdated dependencies resulting in a
failed command. It will either resolve an object or bubble up any valid exceptions in running
the command.

```javascript
import { npm } from '@ominestre/rotten-deps';

const foo = async () => {
  const getOutdatedRequest = npm.createOutdatedRequest();

  try {
    const data = getOutdatedRequest();
    // do stuff with response
  } catch (err) {
    // put out the fire
  }
};
```

#### npm.createDetailsRequest( dependencyName: string ) => function() => Promise<object>
Creates a deferred call to `npm view --json X` where `X` is a dependency name.

```javascript
import { npm } from '@ominestre/rotten-deps';

const foo = async () => {
  const getDetails = createDetailsRequest('@foo/bar');
  const dependencyInfo = await getDetails();
  // do stuff with info
};
```
