# rotten deps

The command `npm outdated` only has two endpoints which are pass or fail. This dichotomy isn't very useful for CI
flows which have pass, fail, or warn. This CLI utility combines `npm outdated` and `npm view` in order to establish
a compliance period for dependency checks. This way if a dependency update is within your compliance period you can
trigger a warn or if it's beyond your compliance period it can trigger a fail.

## API

### Config Lib: `src/config.ts`

#### createFileReader( absoluteFilePath: string ) => function
This function creates a promisified wrapper of `fs.readFileSync` using the provided absolute path for execution down
the road.

```javascript
const reader = configLib.createFileReader('/some/absolute/path');
const data = await reader();
```