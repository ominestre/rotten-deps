# rotten deps

![Node.js CI](https://github.com/ominestre/rotten-deps/workflows/Node.js%20CI/badge.svg)

The command `npm outdated` only has two endpoints which are pass or fail. This dichotomy isn't very useful for CI
flows which have pass, fail, or warn. This CLI utility combines `npm outdated` and `npm view` in order to establish
a compliance period for dependency checks. This way if a dependency update is within your compliance period you can
trigger a warn or if it's beyond your compliance period it can trigger a fail.

## Installation

Most usecases you will want to install this as a project dependency using `yarn add --dev @ominestre/rotten-deps` or `npm i --save-dev @ominestre/rotten-deps`.
Then you can create a task in `package.json` to run. You can use `rotten-deps --help` or checkout the CLI section before for options.

## Config File

TBD

## CLI

### Options

#### `--config-path <string>`

Specifies a path to your configuration file

#### `--json`

The output will be json instead of a table. Useful if you're consuming this output programmatically.

#### `--default-expiration <number>`

This will set a default grace period for expiration to all depedencies not defined in rules. If a dependency is defined within the rules that setting takes priority.

### Exit Code Meanings

* `0` indicates that no depedencies are stale or outdated
* `1` indicates that you have outdated dependencies
* `2` indicates that you have stale dependencies but no outdated

You can use this in various CI pips to flag the task as good, warn, or fail.

## API

TBD
